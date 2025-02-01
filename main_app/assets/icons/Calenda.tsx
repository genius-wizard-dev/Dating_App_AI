import * as React from "react"
import Svg, { SvgProps, G, Path } from "react-native-svg"

interface CalendaProps extends SvgProps {
    color?: string
}

const Calenda = ({ color = "#000", ...props }: CalendaProps) => (
    <Svg width={24} height={24} {...props}>
        <G fill="none">
            <Path fill={color} d="M4 7v2h16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2" />
            <Path
                stroke={color}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 5h2a2 2 0 0 1 2 2v2H4V7a2 2 0 0 1 2-2h2m8 0V3m0 2H8m0-2v2M4 9.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9.5"
            />
        </G>
    </Svg>
)
export default Calenda