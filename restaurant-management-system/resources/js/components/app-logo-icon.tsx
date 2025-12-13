import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
            <path
                fill="currentColor"
                d="M6 34V8h6l8 12 8-12h6v26h-6V18l-8 12-8-12v16H6z"
            />
        </svg>
    );
}
