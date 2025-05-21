export default function generateId () {
  const timestamp = Date.now()
  const last7Digits = String(timestamp % 1e7).padStart(7, '0')
  return last7Digits
}
