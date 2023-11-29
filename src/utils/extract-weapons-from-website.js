const variantNames = [
  "Precision",
  "Deadeye",
  "Marksman",
  "Sniper",
  "Bayonet",
  "Riposte",
  "Trauma",
  "Striker",
  "Brawler",
  "Mace",
  "Talon",
  "Aperture",
  "Swift",
  "Match",
  "Precision",
  "Claw",
]

// Extract weapons from https://huntshowdown.rocks/en/weapons
function extractWeaponInfo() {
  const weapons = document.querySelectorAll(".weapon")
  const weaponInfo = []

  weapons.forEach((weapon) => {
    const weaponName = weapon.querySelector(".weaponname")?.textContent.trim()

    if (variantNames.some((it) => weaponName?.includes(it))) return

    const damageElement = weapon.querySelector('.weaponTopLine[data-type="damage"]')
    const damage = damageElement ? parseInt(damageElement.querySelector("span").textContent.trim()) : null

    const imageEls = Array.from(weapon.querySelectorAll("div.special > img")) || []

    // Determine ammo type
    let ammoType = "unknown"
    if (imageEls.some((it) => it.src.includes("compact"))) ammoType = "compact"
    if (imageEls.some((it) => it.src.includes("medium"))) ammoType = "medium"
    if (imageEls.some((it) => it.src.includes("long"))) ammoType = "long"
    if (imageEls.some((it) => it.src.includes("shells"))) ammoType = "shotgun"

    // Check if silenced
    const isSilenced = weaponName?.includes("Silencer")

    // Check if it has an FMJ variant
    const hasFMJ = imageEls.some((it) => it.src.includes("fullmetaljacket"))
    const hasSpitzer = imageEls.some((it) => it.src.includes("spitzer"))
    const hasDumDum = imageEls.some((it) => it.src.includes("dumdum"))

    weaponInfo.push({
      name: weaponName,
      ammoType: ammoType,
      damage: damage,
      silenced: isSilenced,
      hasFMJ: hasFMJ,
      hasSpitzer: hasSpitzer,
      hasDumDum: hasDumDum,
    })
  })

  return weaponInfo
}

function main() {
  const weapons = extractWeaponInfo()
  console.table(weapons)
}

main()
