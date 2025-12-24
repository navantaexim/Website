export default function GlobalReach() {
  const countries = [
    { name: 'India', flag: '🇮🇳' },
    { name: 'USA', flag: '🇺🇸' },
    { name: 'Germany', flag: '🇩🇪' },
    { name: 'Japan', flag: '🇯🇵' },
    { name: 'China', flag: '🇨🇳' },
    { name: 'UK', flag: '🇬🇧' },
    { name: 'Singapore', flag: '🇸🇬' },
    { name: 'UAE', flag: '🇦🇪' },
  ]

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Global Reach
            </h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Your products deserve a global stage — we make sure they reach the
              right markets, at the right time, with reliable expertise.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {countries.map((country) => (
                <div
                  key={country.name}
                  className="bg-white p-4 rounded-lg border border-border text-center hover:shadow-md transition"
                >
                  <div className="text-3xl mb-2">{country.flag}</div>
                  <p className="text-sm font-medium text-foreground">
                    {country.name}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-80 flex items-center justify-center">
            <svg
              className="w-full h-full"
              viewBox="0 0 400 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient
                  id="mapGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              <circle
                cx="100"
                cy="80"
                r="40"
                fill="url(#mapGradient)"
                opacity="0.6"
              />
              <circle
                cx="250"
                cy="100"
                r="35"
                fill="url(#mapGradient)"
                opacity="0.6"
              />
              <circle
                cx="320"
                cy="180"
                r="30"
                fill="url(#mapGradient)"
                opacity="0.6"
              />
              <circle
                cx="150"
                cy="240"
                r="38"
                fill="url(#mapGradient)"
                opacity="0.6"
              />

              <line
                x1="100"
                y1="80"
                x2="250"
                y2="100"
                stroke="#a5b4fc"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <line
                x1="250"
                y1="100"
                x2="320"
                y2="180"
                stroke="#a5b4fc"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <line
                x1="150"
                y1="240"
                x2="250"
                y2="100"
                stroke="#a5b4fc"
                strokeWidth="1.5"
                opacity="0.4"
              />
              <line
                x1="100"
                y1="80"
                x2="150"
                y2="240"
                stroke="#a5b4fc"
                strokeWidth="1.5"
                opacity="0.4"
              />

              <circle cx="100" cy="80" r="6" fill="#4f46e5" />
              <circle cx="250" cy="100" r="6" fill="#4f46e5" />
              <circle cx="320" cy="180" r="6" fill="#4f46e5" />
              <circle cx="150" cy="240" r="6" fill="#4f46e5" />

              <text
                x="200"
                y="30"
                fontSize="20"
                fill="#6366f1"
                textAnchor="middle"
              >
                Global Network
              </text>
              <text
                x="200"
                y="280"
                fontSize="14"
                fill="#6b7280"
                textAnchor="middle"
              >
                50+ Countries Connected
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
