const modulePaths = [
  '../src/routes/index.js',
  '../src/routes/report.routes.js',
  '../src/services/report.service.js',
  '../src/services/pdf.service.js',
  '../src/services/email.service.js',
  '../src/jobs/index.js',
]

for (const modulePath of modulePaths) {
  await import(modulePath)
}

console.log(`Verified ${modulePaths.length} backend modules.`)
