import { Font } from "@react-pdf/renderer"
import { readFileSync } from "fs"
import path from "path"

function fontSrc(filename: string): string {
  const buf = readFileSync(path.join(process.cwd(), "public", "fonts", filename))
  return `data:font/woff;base64,${buf.toString("base64")}`
}

const src400 = fontSrc("montserrat-latin-400-normal.woff")
const src500 = fontSrc("montserrat-latin-500-normal.woff")
const src700 = fontSrc("montserrat-latin-700-normal.woff")

Font.register({
  family: "Montserrat",
  fonts: [
    { src: src400, fontWeight: 400 },
    { src: src500, fontWeight: 500 },
    { src: src700, fontWeight: 700 },
  ],
})

Font.register({ family: "Montserrat-Bold",   src: src700 })
Font.register({ family: "Montserrat-Medium", src: src500 })
