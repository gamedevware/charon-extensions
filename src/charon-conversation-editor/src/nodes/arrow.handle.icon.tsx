export default function ArrowHandleIcon({ size = 24, color = 'currentColor', ...props }: { size?: number; color?: string; props?: any }) {

    return (
        <svg width={size}
            height={size}
            viewBox="2 -4 20 20"
            fill={color}
            {...props} >

            <g
                strokeWidth="1"
                stroke="none"
                fillRule="evenodd"
                fill="none">
                <g transform="translate(-60.000000, -8163.000000)">
                    <g fill="white"
                        transform="translate(56.000000, 160.000000)">
                        <path
                            d="m 23.2,8007.4 -5.6,-4.2 c -0.173,-0.13 -0.384,-0.2 -0.6,-0.2 h -5 c -1.105,0 -2,0.895 -2,2 v 8 c 0,1.105 0.895,2 2,2 h 5 c 0.216,0 0.427,-0.07 0.6,-0.2 l 5.6,-4.2 c 1.067,-0.8 1.067,-2.4 0,-3.2 z" />
                    </g>
                    <g fill={color}
                        transform="translate(56.000000, 160.000000)">
                        <path
                            d="m 16.8,8012.9 c -0.087,0.065 -0.192,0.1 -0.3,0.1 H 13 c -0.552,0 -1,-0.448 -1,-1 v -6 c 0,-0.552 0.448,-1 1,-1 h 3.5 c 0.108,0 0.213,0.035 0.3,0.1 l 5.2,3.9 z m 6.4,-5.5 -5.6,-4.2 c -0.173,-0.13 -0.384,-0.2 -0.6,-0.2 h -5 c -1.105,0 -2,0.895 -2,2 v 8 c 0,1.105 0.895,2 2,2 h 5 c 0.216,0 0.427,-0.07 0.6,-0.2 l 5.6,-4.2 c 1.067,-0.8 1.067,-2.4 0,-3.2 z" />
                    </g>
                </g>
            </g>
        </svg>
    );
};