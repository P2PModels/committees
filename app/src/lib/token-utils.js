export function getTokenSymbol(name, upperCase) {
  let initials = ''
  name.split(' ').forEach(word => {
    if (upperCase) initials += word.charAt(0).toUpperCase()
    else initials += word.charAt(0).toLowerCase()
  })
  if (upperCase) initials += 'T'.toUpperCase()
  else initials += 'T'

  return initials
}

export function getTokenName(symbol) {
  return symbol + ' Token'
}
