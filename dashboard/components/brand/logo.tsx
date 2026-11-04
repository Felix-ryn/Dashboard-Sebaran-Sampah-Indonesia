/**
 * Logo "Jejak Sampah": tong sampah dengan empat batang grafik.
 * Dibuat ulang sebagai SVG dari logo asli (dashboard/source) supaya tiap bagian
 * bisa dianimasikan: .logo-outline = garis tong (digambar), .logo-bar = batang (tumbuh).
 */
export function LogoMark({
  className,
  title = "Jejak Sampah",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox="140 120 800 980"
      className={className}
      role="img"
      aria-label={title}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <g className="logo-lid" stroke="#6B96A8" strokeWidth="32">
        <path
          className="logo-outline"
          pathLength={1}
          d="M416 235V205Q416 156 466 156H614Q664 156 664 205V235"
        />
        <path
          className="logo-outline"
          pathLength={1}
          d="M232 318L240 285Q252 234 312 234H768Q828 234 840 285L848 318"
        />
        <rect
          className="logo-outline"
          pathLength={1}
          x="174"
          y="318"
          width="732"
          height="84"
          rx="26"
        />
      </g>
      <g stroke="#6B96A8" strokeWidth="32">
        <path
          className="logo-outline"
          pathLength={1}
          d="M218 402L270 995Q272 1060 345 1060H735Q808 1060 810 995L862 402"
        />
      </g>
      <g stroke="none">
        <rect className="logo-bar" x="333" y="741" width="82" height="249" fill="#9ACE91" />
        <rect className="logo-bar" x="445" y="614" width="82" height="376" fill="#65ADCB" />
        <rect className="logo-bar" x="557" y="659" width="82" height="331" fill="#3B78A5" />
        <rect className="logo-bar" x="669" y="526" width="82" height="464" fill="#367F4E" />
      </g>
    </svg>
  );
}
