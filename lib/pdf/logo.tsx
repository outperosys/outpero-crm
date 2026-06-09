import { Text, View } from "@react-pdf/renderer"
import { COLORS, FONTS } from "./tokens"

// Renders the agency name with the trailing "O" replaced by a ring circle.
// The ring is sized to match the cap-height of the text and uses a bold border.
export function AgencyLogo({
  name,
  size = 14,
  color = COLORS.black,
}: {
  name: string
  size?: number
  color?: string
}) {
  const upper = name.toUpperCase()
  const endsO = upper.endsWith("O")
  const mainText = endsO ? upper.slice(0, -1) : upper

  // Cap-height of Montserrat at this size (≈ 72% of em)
  const capH = size * 0.72
  // Ring is cap-height square, border ~16% of its diameter
  const ringSize = capH
  const ringBorder = Math.max(1.4, ringSize * 0.16)

  return (
    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
      <Text
        style={{
          fontSize: size,
          fontFamily: FONTS.bold,
          color,
          letterSpacing: 1.5,
        }}
      >
        {mainText}
      </Text>
      {endsO ? (
        <View
          style={{
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            borderWidth: ringBorder,
            borderStyle: "solid",
            borderColor: color,
            marginLeft: size * 0.12,
            marginTop: size * 0.06,
          }}
        />
      ) : (
        <Text
          style={{
            fontSize: size,
            fontFamily: FONTS.bold,
            color,
            letterSpacing: 1.5,
          }}
        >
          {upper.slice(-1)}
        </Text>
      )}
    </View>
  )
}
