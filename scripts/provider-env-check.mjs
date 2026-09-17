const keys = [
  'NVIDIA_API_KEY',
  'NVIDIA_NIM_API_BASE',
  'LITELLM_MASTER_KEY',
  'LITELLM_BASE_URL',
  'LITELLM_API_KEY',
]

const present = Object.fromEntries(keys.map((key) => [key, Boolean(process.env[key]?.trim())]))
console.log(JSON.stringify({ present }, null, 2))
