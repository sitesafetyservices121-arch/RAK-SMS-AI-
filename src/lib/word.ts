"use server";

import { Buffer } from "buffer";

type Paragraph = {
  text: string;
  bold?: boolean;
  isBullet?: boolean;
};

type Section = {
  title: string;
  paragraphs: Paragraph[];
};

type LogoInfo = {
  data: Buffer;
  contentType: string;
  extension: string;
};

export type WordDocumentOptions = {
  title: string;
  companyName: string;
  clientName?: string;
  generatedBy: string;
  isoStandard?: string;
  sections: Section[];
  logo?: LogoInfo | null;
};

type ZipEntry = {
  filename: string;
  data: Buffer;
};

const ZIP_LOCAL_FILE_HEADER_SIGNATURE = 0x04034b50;
const ZIP_CENTRAL_DIRECTORY_SIGNATURE = 0x02014b50;
const ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE = 0x06054b50;

const crc32Table = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i++) {
    const byte = buffer[i];
    crc = crc32Table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function toDosDateTime(date: Date): { date: number; time: number } {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = Math.floor(date.getSeconds() / 2);

  const dosDate = ((year - 1980) << 9) | (month << 5) | day;
  const dosTime = (hours << 11) | (minutes << 5) | seconds;

  return { date: dosDate, time: dosTime };
}

function createZip(entries: ZipEntry[]): Buffer {
  const now = new Date();
  const { date, time } = toDosDateTime(now);

  let offset = 0;
  const localFileParts: Buffer[] = [];
  const centralDirectoryParts: Buffer[] = [];

  for (const entry of entries) {
    const fileNameBuffer = Buffer.from(entry.filename, "utf8");
    const fileData = entry.data;
    const crc = crc32(fileData);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(ZIP_LOCAL_FILE_HEADER_SIGNATURE, 0);
    localHeader.writeUInt16LE(20, 4); // version needed
    localHeader.writeUInt16LE(0, 6); // general purpose bit flag
    localHeader.writeUInt16LE(0, 8); // compression method (store)
    localHeader.writeUInt16LE(time, 10);
    localHeader.writeUInt16LE(date, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(fileData.length, 18);
    localHeader.writeUInt32LE(fileData.length, 22);
    localHeader.writeUInt16LE(fileNameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28); // extra field length

    const localRecord = Buffer.concat([localHeader, fileNameBuffer, fileData]);
    localFileParts.push(localRecord);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(ZIP_CENTRAL_DIRECTORY_SIGNATURE, 0);
    centralHeader.writeUInt16LE(20, 4); // version made by
    centralHeader.writeUInt16LE(20, 6); // version needed to extract
    centralHeader.writeUInt16LE(0, 8); // general purpose bit flag
    centralHeader.writeUInt16LE(0, 10); // compression method
    centralHeader.writeUInt16LE(time, 12);
    centralHeader.writeUInt16LE(date, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(fileData.length, 20);
    centralHeader.writeUInt32LE(fileData.length, 24);
    centralHeader.writeUInt16LE(fileNameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30); // extra field length
    centralHeader.writeUInt16LE(0, 32); // file comment length
    centralHeader.writeUInt16LE(0, 34); // disk number start
    centralHeader.writeUInt16LE(0, 36); // internal file attributes
    centralHeader.writeUInt32LE(0, 38); // external file attributes
    centralHeader.writeUInt32LE(offset, 42);

    const centralRecord = Buffer.concat([centralHeader, fileNameBuffer]);
    centralDirectoryParts.push(centralRecord);

    offset += localRecord.length;
  }

  const centralDirectory = Buffer.concat(centralDirectoryParts);
  const endRecord = Buffer.alloc(22);
  endRecord.writeUInt32LE(ZIP_END_OF_CENTRAL_DIRECTORY_SIGNATURE, 0);
  endRecord.writeUInt16LE(0, 4); // number of this disk
  endRecord.writeUInt16LE(0, 6); // disk where central directory starts
  endRecord.writeUInt16LE(entries.length, 8); // number of central directory records on this disk
  endRecord.writeUInt16LE(entries.length, 10); // total number of records
  endRecord.writeUInt32LE(centralDirectory.length, 12); // size of central directory
  endRecord.writeUInt32LE(offset, 16); // offset of central directory
  endRecord.writeUInt16LE(0, 20); // comment length

  return Buffer.concat([...localFileParts, centralDirectory, endRecord]);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function createParagraphXml(paragraph: Paragraph, style?: string): string {
  const text = escapeXml(paragraph.text);
  const bulletPrefix = paragraph.isBullet ? "• " : "";
  const paragraphProps = style
    ? `<w:pPr><w:pStyle w:val=\"${style}\"/></w:pPr>`
    : "";
  const runProps = paragraph.bold ? "<w:rPr><w:b/></w:rPr>" : "";
  return `
    <w:p>
      ${paragraphProps}
      <w:r>
        ${runProps}
        <w:t xml:space="preserve">${bulletPrefix}${text}</w:t>
      </w:r>
    </w:p>
  `;
}

function createSectionXml(section: Section, headingLevel: "Heading1" | "Heading2" = "Heading2"): string {
  const headingParagraph = createParagraphXml({ text: section.title, bold: true }, headingLevel);
  const bodyParagraphs = section.paragraphs
    .map((paragraph) => createParagraphXml(paragraph))
    .join("");
  return `${headingParagraph}${bodyParagraphs}`;
}

function buildDocumentXml(options: WordDocumentOptions): string {
  const isoStatement = options.isoStandard
    ? `This document aligns with ${escapeXml(options.isoStandard)} requirements.`
    : "This document aligns with ISO safety management expectations.";

  const headerParagraph = createParagraphXml(
    { text: options.title, bold: true },
    "Title"
  );
  const companyParagraph = createParagraphXml({
    text: `Prepared for ${options.companyName}${options.clientName ? ` | Client: ${options.clientName}` : ""}`,
  });
  const generatedParagraph = createParagraphXml({
    text: `Generated on ${new Date().toLocaleDateString()} by ${options.generatedBy}. ${isoStatement}`,
  });

  const sectionsXml = options.sections
    .map((section) => createSectionXml(section))
    .join("");

  const logoXml = options.logo
    ? `
      <w:p>
        <w:r>
          <w:drawing>
            <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
              <wp:extent cx="2743200" cy="1143000"/>
              <wp:docPr id="1" name="Company Logo"/>
              <a:graphic>
                <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                  <pic:pic>
                    <pic:nvPicPr>
                      <pic:cNvPr id="0" name="Logo"/>
                      <pic:cNvPicPr>
                        <a:picLocks noChangeAspect="1"/>
                      </pic:cNvPicPr>
                    </pic:nvPicPr>
                    <pic:blipFill>
                      <a:blip r:embed="rIdLogo"/>
                      <a:stretch><a:fillRect/></a:stretch>
                    </pic:blipFill>
                    <pic:spPr>
                      <a:xfrm>
                        <a:off x="0" y="0"/>
                        <a:ext cx="2743200" cy="1143000"/>
                      </a:xfrm>
                      <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                    </pic:spPr>
                  </pic:pic>
                </a:graphicData>
              </a:graphic>
            </wp:inline>
          </w:drawing>
        </w:r>
      </w:p>
    `
    : "";

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
    xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
    xmlns:o="urn:schemas-microsoft-com:office:office"
    xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
    xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
    xmlns:v="urn:schemas-microsoft-com:vml"
    xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
    xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
    xmlns:w10="urn:schemas-microsoft-com:office:word"
    xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
    xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
    xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
    xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
    xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
    xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
    mc:Ignorable="w14 wp14">
    <w:body>
      ${logoXml}
      ${headerParagraph}
      ${companyParagraph}
      ${generatedParagraph}
      ${sectionsXml}
      <w:p/>
      <w:sectPr>
        <w:pgSz w:w="11907" w:h="16840" w:orient="portrait"/>
        <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="851" w:footer="992" w:gutter="0"/>
        <w:cols w:space="708"/>
        <w:docGrid w:type="lines" w:linePitch="360"/>
      </w:sectPr>
    </w:body>
  </w:document>`;
}

function buildStylesXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
    <w:style w:type="paragraph" w:default="1" w:styleId="Normal">
      <w:name w:val="Normal"/>
      <w:qFormat/>
      <w:pPr>
        <w:spacing w:after="160"/>
      </w:pPr>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="22"/>
        <w:szCs w:val="22"/>
      </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading1">
      <w:name w:val="Heading 1"/>
      <w:basedOn w:val="Normal"/>
      <w:next w:val="Normal"/>
      <w:uiPriority w:val="9"/>
      <w:qFormat/>
      <w:pPr>
        <w:spacing w:before="240" w:after="120"/>
      </w:pPr>
      <w:rPr>
        <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
        <w:sz w:val="32"/>
        <w:szCs w:val="32"/>
      </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Heading2">
      <w:name w:val="Heading 2"/>
      <w:basedOn w:val="Normal"/>
      <w:next w:val="Normal"/>
      <w:uiPriority w:val="9"/>
      <w:qFormat/>
      <w:pPr>
        <w:spacing w:before="160" w:after="80"/>
      </w:pPr>
      <w:rPr>
        <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
        <w:sz w:val="26"/>
        <w:szCs w:val="26"/>
      </w:rPr>
    </w:style>
    <w:style w:type="paragraph" w:styleId="Title">
      <w:name w:val="Title"/>
      <w:basedOn w:val="Normal"/>
      <w:qFormat/>
      <w:pPr>
        <w:spacing w:before="240" w:after="160"/>
        <w:jc w:val="center"/>
      </w:pPr>
      <w:rPr>
        <w:rFonts w:ascii="Calibri Light" w:hAnsi="Calibri Light"/>
        <w:sz w:val="36"/>
        <w:szCs w:val="36"/>
      </w:rPr>
    </w:style>
  </w:styles>`;
}

function buildDocumentRelationshipsXml(logo?: LogoInfo | null): string {
  const logoRelationship = logo
    ? `<Relationship Id="rIdLogo" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/logo.${logo.extension}"/>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
    ${logoRelationship}
  </Relationships>`;
}

function buildRootRelationshipsXml(): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
    <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
    <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
    <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
  </Relationships>`;
}

function buildCorePropertiesXml(options: WordDocumentOptions): string {
  const nowIso = new Date().toISOString();
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
    <dc:title>${escapeXml(options.title)}</dc:title>
    <dc:subject>ISO-Compliant Safety Document</dc:subject>
    <dc:creator>${escapeXml(options.generatedBy)}</dc:creator>
    <cp:keywords>${escapeXml(options.isoStandard ?? "ISO 45001")}</cp:keywords>
    <cp:lastModifiedBy>${escapeXml(options.generatedBy)}</cp:lastModifiedBy>
    <dcterms:created xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:created>
    <dcterms:modified xsi:type="dcterms:W3CDTF">${nowIso}</dcterms:modified>
  </cp:coreProperties>`;
}

function buildAppPropertiesXml(options: WordDocumentOptions): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
    <Application>RAK SMS AI Document Generator</Application>
    <DocSecurity>0</DocSecurity>
    <ScaleCrop>false</ScaleCrop>
    <HeadingPairs>
      <vt:vector size="2" baseType="variant">
        <vt:variant><vt:lpstr>Title</vt:lpstr></vt:variant>
        <vt:variant><vt:lpstr>${escapeXml(options.title)}</vt:lpstr></vt:variant>
      </vt:vector>
    </HeadingPairs>
    <TitlesOfParts>
      <vt:vector size="1" baseType="lpstr">
        <vt:lpstr>${escapeXml(options.title)}</vt:lpstr>
      </vt:vector>
    </TitlesOfParts>
    <Company>${escapeXml(options.companyName)}</Company>
    <LinksUpToDate>false</LinksUpToDate>
    <CharactersWithSpaces>0</CharactersWithSpaces>
  </Properties>`;
}

function buildContentTypesXml(logo?: LogoInfo | null): string {
  const imageOverride = logo
    ? `<Override PartName="/word/media/logo.${logo.extension}" ContentType="${logo.contentType}"/>`
    : "";
  const defaultImages = logo && logo.extension === "jpeg"
    ? '<Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="jpg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/>'
    : '<Default Extension="png" ContentType="image/png"/>';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
  <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
    <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
    <Default Extension="xml" ContentType="application/xml"/>
    ${defaultImages}
    <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
    <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
    <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
    <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
    ${imageOverride}
  </Types>`;
}

export function decodeDataUri(dataUri: string | null | undefined): LogoInfo | null {
  if (!dataUri) return null;
  const match = /^data:(.+);base64,(.+)$/.exec(dataUri);
  if (!match) {
    return null;
  }
  const [, mime, base64Data] = match;
  if (!/^image\/(png|jpe?g)$/i.test(mime)) {
    return null;
  }
  const buffer = Buffer.from(base64Data, "base64");
  const extension = mime.toLowerCase() === "image/png" ? "png" : "jpeg";
  return {
    data: buffer,
    contentType: mime,
    extension,
  };
}

export type GeneratedWordDocument = {
  buffer: Buffer;
  downloadUrl: string;
};

export function generateWordDocument(options: WordDocumentOptions): GeneratedWordDocument {
  const documentXml = buildDocumentXml(options);
  const stylesXml = buildStylesXml();
  const documentRelsXml = buildDocumentRelationshipsXml(options.logo);
  const rootRelsXml = buildRootRelationshipsXml();
  const corePropsXml = buildCorePropertiesXml(options);
  const appPropsXml = buildAppPropertiesXml(options);
  const contentTypesXml = buildContentTypesXml(options.logo);

  const entries: ZipEntry[] = [
    { filename: "[Content_Types].xml", data: Buffer.from(contentTypesXml) },
    { filename: "_rels/.rels", data: Buffer.from(rootRelsXml) },
    { filename: "docProps/core.xml", data: Buffer.from(corePropsXml) },
    { filename: "docProps/app.xml", data: Buffer.from(appPropsXml) },
    { filename: "word/document.xml", data: Buffer.from(documentXml) },
    { filename: "word/styles.xml", data: Buffer.from(stylesXml) },
    { filename: "word/_rels/document.xml.rels", data: Buffer.from(documentRelsXml) },
  ];

  if (options.logo) {
    entries.push({ filename: `word/media/logo.${options.logo.extension}`, data: options.logo.data });
  }

  const zipBuffer = createZip(entries);
  const downloadUrl = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${zipBuffer.toString("base64")}`;
  return { buffer: zipBuffer, downloadUrl };
}

export function convertMarkdownToSections(markdown: string): Section[] {
  const lines = markdown.split(/\r?\n/);
  const sections: Section[] = [];
  let currentSection: Section | null = null;

  const pushParagraph = (text: string, isBullet = false) => {
    if (!currentSection) {
      currentSection = {
        title: "General",
        paragraphs: [],
      };
      sections.push(currentSection);
    }
    currentSection.paragraphs.push({ text: text.trim(), isBullet });
  };

  for (const line of lines) {
    if (/^##\s+/.test(line)) {
      const title = line.replace(/^##\s+/, "").trim();
      currentSection = {
        title,
        paragraphs: [],
      };
      sections.push(currentSection);
      continue;
    }
    if (/^\s*-\s+/.test(line) || /^\s*\*\s+/.test(line)) {
      const text = line.replace(/^\s*[-*]\s+/, "");
      pushParagraph(text, true);
      continue;
    }
    if (line.trim() === "") {
      continue;
    }
    pushParagraph(line);
  }

  return sections.length > 0 ? sections : [];
}

export type WordSection = Section;
export type WordParagraph = Paragraph;
