"use client";

export default function LogoWordmark({ className = "" }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 760 200"
            role="img"
            aria-label="EmpleaHub"
            className={className}
            //eslint-disable-next-line @typescript-eslint/no-explicit-any
            style={{ ["--logo-accent" as any]: "#22A36B" }}
        >
            {/* Aro verde */}
            <circle cx="80" cy="96" r="72" fill="none" stroke="var(--logo-accent)" strokeWidth="16" />

            {/* Persona */}
            <circle cx="80" cy="66" r="18" fill="currentColor" />
            <path d="M50 120c0-18 13-33 30-33s30 15 30 33v7H50v-7z" fill="currentColor" />

            {/* Maletín */}
            <g transform="translate(102,100)">
                <rect x="0" y="16" width="66" height="46" rx="9" fill="currentColor" />
                <rect x="24" y="6" width="18" height="12" rx="3" fill="currentColor" />
                <rect x="30" y="0" width="6" height="6" rx="2" fill="currentColor" />
                <rect x="29" y="36" width="8" height="10" rx="2" className="fill-white dark:fill-black" />
                <path d="M-3 38h72" className="stroke-white dark:stroke-black" strokeWidth="6" strokeLinecap="round" />
            </g>

            {/* Texto principal */}
            <text
                x="200"
                y="115"
                fontFamily="Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial"
                fontWeight="700"
                fontSize="80"
                letterSpacing="0.5"
                fill="currentColor"
            >
                EmpleaHub
            </text>

            {/* Subtítulo */}
            {/* <text
                x="200"
                y="145"
                fontFamily="Poppins, Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial"
                fontWeight="400"
                fontSize="22"
                letterSpacing="0.8"
                opacity="0.85"
                fill="currentColor"
            >
                Plataforma Integral de Empleabilidad
            </text> */}
        </svg>
    );
}
