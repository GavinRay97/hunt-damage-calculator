import "chart.js/auto"
import { Line } from "react-chartjs-2"
import annotationPlugin, { AnnotationOptions } from "chartjs-plugin-annotation"
import { Chart as ChartJS } from "chart.js"
import { useEffect, useState } from "react"

// Register annotation plugin with React Chart.js
ChartJS.register(annotationPlugin)

enum AmmoTypeName {
  Compact = "Compact",
  CompactFMJ = "Compact FMJ",
  CompactSilenced = "Compact Silenced",
  CompactSilencedFMJ = "Compact Silenced FMJ",
  CompactPistol = "Compact Pistol",
  CompactPistolFMJ = "Compact Pistol FMJ",
  CompactPistolSilenced = "Compact Silenced Pistol",

  Medium = "Medium",
  MediumFMJ = "Medium FMJ",
  MediumSilenced = "Medium Silenced",
  MediumSilencedFMJ = "Medium Silenced FMJ",
  MediumPistol = "Medium Pistol",
  MediumPistolFMJ = "Medium Pistol FMJ",

  Long = "Long",
  LongFMJ = "Long FMJ",
  LongSilenced = "Long Silenced",
  LongSilencedFMJ = "Long Silenced FMJ",
  LongPistol = "Long Pistol",
  LongPistolFMJ = "Long Pistol FMJ",
  LongSpitzer = "Long Spitzer",

  Nitro = "Nitro",
  Shotgun = "Shotgun",
}

enum AmmoFlags {
  Compact = 1 << 0,
  Medium = 1 << 1,
  Long = 1 << 2,
  Shotgun = 1 << 3,
  Nitro = 1 << 4,
  Silenced = 1 << 5,
  FMJ = 1 << 6,
  Spitzer = 1 << 7,
  Pistol = 1 << 8,
}

// A map of <AmmoTypeName, AmmoFlags>
// This is used to determine which flags a given ammo type has
const AMMO_TYPE_TO_FLAGS: Record<AmmoTypeName, AmmoFlags> = {
  [AmmoTypeName.Compact]: AmmoFlags.Compact,
  [AmmoTypeName.CompactFMJ]: AmmoFlags.Compact | AmmoFlags.FMJ,
  [AmmoTypeName.CompactSilenced]: AmmoFlags.Compact | AmmoFlags.Silenced,
  [AmmoTypeName.CompactSilencedFMJ]: AmmoFlags.Compact | AmmoFlags.Silenced | AmmoFlags.FMJ,
  [AmmoTypeName.CompactPistol]: AmmoFlags.Compact | AmmoFlags.Pistol,
  [AmmoTypeName.CompactPistolFMJ]: AmmoFlags.Compact | AmmoFlags.Pistol | AmmoFlags.FMJ,
  [AmmoTypeName.CompactPistolSilenced]: AmmoFlags.Compact | AmmoFlags.Pistol | AmmoFlags.Silenced,

  [AmmoTypeName.Medium]: AmmoFlags.Medium,
  [AmmoTypeName.MediumFMJ]: AmmoFlags.Medium | AmmoFlags.FMJ,
  [AmmoTypeName.MediumSilenced]: AmmoFlags.Medium | AmmoFlags.Silenced,
  [AmmoTypeName.MediumSilencedFMJ]: AmmoFlags.Medium | AmmoFlags.Silenced | AmmoFlags.FMJ,
  [AmmoTypeName.MediumPistol]: AmmoFlags.Medium | AmmoFlags.Pistol,
  [AmmoTypeName.MediumPistolFMJ]: AmmoFlags.Medium | AmmoFlags.Pistol | AmmoFlags.FMJ,

  [AmmoTypeName.Long]: AmmoFlags.Long,
  [AmmoTypeName.LongFMJ]: AmmoFlags.Long | AmmoFlags.FMJ,
  [AmmoTypeName.LongSilenced]: AmmoFlags.Long | AmmoFlags.Silenced,
  [AmmoTypeName.LongSilencedFMJ]: AmmoFlags.Long | AmmoFlags.Silenced | AmmoFlags.FMJ,
  [AmmoTypeName.LongPistol]: AmmoFlags.Long | AmmoFlags.Pistol,
  [AmmoTypeName.LongPistolFMJ]: AmmoFlags.Long | AmmoFlags.Pistol | AmmoFlags.FMJ,
  [AmmoTypeName.LongSpitzer]: AmmoFlags.Long | AmmoFlags.Spitzer,

  [AmmoTypeName.Nitro]: AmmoFlags.Nitro,
  [AmmoTypeName.Shotgun]: AmmoFlags.Shotgun,
}

const AMMO_FLAGS_TO_TYPE: Record<number, AmmoTypeName> = {
  [AmmoFlags.Compact]: AmmoTypeName.Compact,
  [AmmoFlags.Compact | AmmoFlags.FMJ]: AmmoTypeName.CompactFMJ,
  [AmmoFlags.Compact | AmmoFlags.Silenced]: AmmoTypeName.CompactSilenced,
  [AmmoFlags.Compact | AmmoFlags.Silenced | AmmoFlags.FMJ]: AmmoTypeName.CompactSilencedFMJ,
  [AmmoFlags.Compact | AmmoFlags.Pistol]: AmmoTypeName.CompactPistol,
  [AmmoFlags.Compact | AmmoFlags.Pistol | AmmoFlags.FMJ]: AmmoTypeName.CompactPistolFMJ,
  [AmmoFlags.Compact | AmmoFlags.Pistol | AmmoFlags.Silenced]: AmmoTypeName.CompactPistolSilenced,

  [AmmoFlags.Medium]: AmmoTypeName.Medium,
  [AmmoFlags.Medium | AmmoFlags.FMJ]: AmmoTypeName.MediumFMJ,
  [AmmoFlags.Medium | AmmoFlags.Silenced]: AmmoTypeName.MediumSilenced,
  [AmmoFlags.Medium | AmmoFlags.Silenced | AmmoFlags.FMJ]: AmmoTypeName.MediumSilencedFMJ,
  [AmmoFlags.Medium | AmmoFlags.Pistol]: AmmoTypeName.MediumPistol,
  [AmmoFlags.Medium | AmmoFlags.Pistol | AmmoFlags.FMJ]: AmmoTypeName.MediumPistolFMJ,

  [AmmoFlags.Long]: AmmoTypeName.Long,
  [AmmoFlags.Long | AmmoFlags.FMJ]: AmmoTypeName.LongFMJ,
  [AmmoFlags.Long | AmmoFlags.Silenced]: AmmoTypeName.LongSilenced,
  [AmmoFlags.Long | AmmoFlags.Silenced | AmmoFlags.FMJ]: AmmoTypeName.LongSilencedFMJ,
  [AmmoFlags.Long | AmmoFlags.Pistol]: AmmoTypeName.LongPistol,
  [AmmoFlags.Long | AmmoFlags.Pistol | AmmoFlags.FMJ]: AmmoTypeName.LongPistolFMJ,
  [AmmoFlags.Long | AmmoFlags.Spitzer]: AmmoTypeName.LongSpitzer,

  [AmmoFlags.Nitro]: AmmoTypeName.Nitro,
  [AmmoFlags.Shotgun]: AmmoTypeName.Shotgun,
}

const AMMO_TYPE_TO_DAMAGE_AT_DISTANCE: Record<AmmoTypeName, (distance: number) => number> = {
  [AmmoTypeName.Compact]: (d) => {
    switch (true) {
      /*Compact Ammo Damage Drop off*/
      case d <= 20:
        return 1
      case d <= 30:
        return 1 - 0.014 * (d - 20)
      case d <= 50:
        return 0.86 - 0.014 * (d - 30)
      case d <= 70:
        return 0.58 - 0.0075 * (d - 50)
      case d <= 100:
        return 0.43 - 0.0033 * (d - 70)
      case d <= 250:
        return 0.331 - 0.00074 * (d - 100)
      case d > 250:
        return 0.1
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.CompactFMJ]: (d) => {
    switch (true) {
      /*Compact FMJ Ammo Damage Drop off*/
      case d <= 30:
        return 1
      case d <= 40:
        return 1 - 0.014 * (d - 30)
      case d <= 60:
        return 0.86 - 0.014 * (d - 40)
      case d <= 80:
        return 0.58 - 0.006 * (d - 60)
      case d <= 110:
        return 0.46 - 0.0043 * (d - 80)
      case d <= 250:
        return 0.331 - 0.00044 * (d - 110)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.CompactSilenced]: (d) => {
    switch (true) {
      /*Compact Silencer Ammo Damage Drop off*/
      case d <= 10:
        return 1
      case d <= 25:
        return 1 - 0.006666667 * (d - 10)
      case d <= 40:
        return 0.9 - 0.02 * (d - 25)
      case d <= 60:
        return 0.6 - 0.0115 * (d - 40)
      case d <= 100:
        return 0.37 - 0.00118 * (d - 60)
      case d <= 250:
        return 0.323 - 0.00082 * (d - 100)
      case d > 250:
        return 0.1
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.CompactSilencedFMJ]: (d) => {
    switch (true) {
      /*Compact Silencer FMJ Ammo Damage Drop off*/
      case d <= 20:
        return 1
      case d <= 35:
        return 1 - 0.006666667 * (d - 20)
      case d <= 50:
        return 0.9 - 0.02 * (d - 35)
      case d <= 70:
        return 0.6 - 0.0075 * (d - 50)
      case d <= 110:
        return 0.45 - 0.00318 * (d - 70)
      case d <= 250:
        return 0.323 - 0.00056 * (d - 110)
      case d > 250:
        return 0.1
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.CompactPistol]: (d) => {
    switch (true) {
      /*Compact Pistol Ammo Damage Drop off*/
      case d <= 20:
        return 1
      case d <= 30:
        return 1 - 0.016 * (d - 20)
      case d <= 50:
        return 0.84 - 0.0155 * (d - 30)
      case d <= 70:
        return 0.53 - 0.008 * (d - 50)
      case d <= 100:
        return 0.37 - 0.004 * (d - 70)
      case d <= 250:
        return 0.25 - 0.0002 * (d - 100)
      case d > 250:
        return 0.1
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.CompactPistolFMJ]: (d) => {
    switch (true) {
      /*Compact Pistol FMJ Ammo Damage Drop off*/
      case d <= 30:
        return 1
      case d <= 40:
        return 1 - 0.016 * (d - 30)
      case d <= 60:
        return 0.84 - 0.0145 * (d - 40)
      case d <= 80:
        return 0.55 - 0.00625 * (d - 60)
      case d <= 110:
        return 0.425 - 0.005 * (d - 80)
      case d <= 250:
        return 0.275 - 0.00039 * (d - 110)
      case d > 250:
        return 0.1
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.CompactPistolSilenced]: (d) => {
    switch (true) {
      /*Compact Silencer Pistol Ammo Damage Drop off*/
      case d <= 10:
        return 1
      case d <= 30:
        return 1 - 0.015333333 * (d - 10)
      case d <= 50:
        return 0.77 - 0.025333333 * (d - 30)
      case d <= 70:
        return 0.39 - 0.0055 * (d - 50)
      case d <= 100:
        return 0.28 - 0.00175 * (d - 70)
      case d <= 350:
        return 0.21 - 7e-5 * (d - 100)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.Medium]: (d) => {
    switch (true) {
      /*Medium Ammo Damage Drop off*/
      case d <= 20:
        return 1
      case d <= 40:
        return 1 - 0.01 * (d - 20)
      case d <= 60:
        return 0.8 - 0.008 * (d - 40)
      case d <= 80:
        return 0.64 - 0.01 * (d - 60)
      case d <= 100:
        return 0.44 - 0.0035 * (d - 80)
      case d <= 350:
        return 0.37 - 0.00068 * (d - 100)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.MediumFMJ]: (d) => {
    switch (true) {
      /*Medium FMJ Ammo Damage Drop off*/
      case d <= 40:
        return 1
      case d <= 60:
        return 1 - 0.01 * (d - 40)
      case d <= 80:
        return 0.8 - 0.008 * (d - 60)
      case d <= 100:
        return 0.64 - 0.007 * (d - 80)
      case d <= 120:
        return 0.5 - 0.005 * (d - 100)
      case d <= 350:
        return 0.4 - 0.00087 * (d - 120)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.MediumSilenced]: (d) => {
    switch (true) {
      /*Medium Silencer Ammo Damage Drop off*/
      case d <= 20:
        return 1
      case d <= 25:
        return 1 - 0.01 * (d - 20)
      case d <= 50:
        return 0.95 - 0.011 * (d - 25)
      case d <= 70:
        return 0.675 - 0.01 * (d - 50)
      case d <= 100:
        return 0.475 - 0.00317 * (d - 70)
      case d <= 200:
        return 0.38 - 0.0013 * (d - 100)
      case d <= 350:
        return 0.25 - 0.00033 * (d - 200)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.MediumSilencedFMJ]: (d) => {
    switch (true) {
      /*Medium Silencer FMJ Ammo Damage Drop off*/
      case d <= 30:
        return 1
      case d <= 40:
        return 1 - 0.01 * (d - 30)
      case d <= 60:
        return 0.9 - 0.01125 * (d - 40)
      case d <= 80:
        return 0.675 - 0.01 * (d - 60)
      case d <= 110:
        return 0.475 - 0.00317 * (d - 80)
      case d <= 220:
        return 0.38 - 0.00118 * (d - 110)
      case d <= 350:
        return 0.25 - 0.00038 * (d - 220)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.MediumPistol]: (d) => {
    switch (true) {
      /*Medium Pistol Ammo Damage Drop off*/
      case d <= 20:
        return 1
      case d <= 30:
        return 1 - 0.011 * (d - 20)
      case d <= 40:
        return 0.89 - 0.013 * (d - 30)
      case d <= 50:
        return 0.76 - 0.016 * (d - 40)
      case d <= 70:
        return 0.6 - 0.008 * (d - 50)
      case d <= 100:
        return 0.44 - 0.005333333 * (d - 70)
      case d <= 350:
        return 0.28 - 0.00052 * (d - 100)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.MediumPistolFMJ]: (d) => {
    switch (true) {
      /*Medium Pistol FMJ Ammo Damage Drop off*/
      case d <= 30:
        return 1
      case d <= 40:
        return 1 - 0.011 * (d - 30)
      case d <= 50:
        return 0.89 - 0.013 * (d - 40)
      case d <= 60:
        return 0.76 - 0.016 * (d - 50)
      case d <= 80:
        return 0.6 - 0.008 * (d - 60)
      case d <= 110:
        return 0.44 - 0.00533 * (d - 80)
      case d <= 350:
        return 0.28 - 0.00054 * (d - 100)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.Long]: (d) => {
    switch (true) {
      /*Long Ammo Damage Drop off*/
      case d <= 40:
        return 1
      case d <= 60:
        return 1 - 0.005 * (d - 40)
      case d <= 80:
        return 0.9 - 0.0075 * (d - 60)
      case d <= 100:
        return 0.75 - 0.0065 * (d - 80)
      case d <= 500:
        return 0.62 - 0.00118 * (d - 100)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.LongFMJ]: (d) => {
    switch (true) {
      /*Long FMJ Ammo Damage Drop off*/
      case d <= 60:
        return 1
      case d <= 80:
        return 1 - 0.005 * (d - 60)
      case d <= 100:
        return 0.9 - 0.0075 * (d - 80)
      case d <= 120:
        return 0.75 - 0.0065 * (d - 100)
      case d <= 500:
        return 0.62 - 0.00124 * (d - 120)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.LongSpitzer]: (d) => {
    switch (true) {
      /*Long Spitzer Ammo Damage Drop off*/
      case d <= 40:
        return 1
      case d <= 60:
        return 1 - 0.005 * (d - 40)
      case d <= 80:
        return 0.9 - 0.0075 * (d - 60)
      case d <= 100:
        return 0.75 - 0.0065 * (d - 80)
      case d <= 270:
        return 0.62 - 0.00065 * (d - 100)
      case d <= 500:
        return 0.51 - 0.00135 * (d - 270)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.LongSilenced]: (d) => {
    switch (true) {
      /*Long Silencer Ammo Damage Drop off*/
      case d <= 30:
        return 1
      case d <= 40:
        return 1 - 0.009 * (d - 30)
      case d <= 60:
        return 0.91 - 0.008 * (d - 40)
      case d <= 80:
        return 0.75 - 0.0145 * (d - 60)
      case d <= 100:
        return 0.46 - 0.0035 * (d - 80)
      case d <= 250:
        return 0.39 - 0.00087 * (d - 100)
      case d <= 500:
        return 0.26 - 0.00044 * (d - 250)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.LongSilencedFMJ]: (d) => {
    switch (true) {
      /*Long Silencer FMJ Ammo Damage Drop off*/
      case d <= 40:
        return 1
      case d <= 50:
        return 1 - 0.009 * (d - 40)
      case d <= 70:
        return 0.91 - 0.008 * (d - 50)
      case d <= 90:
        return 0.75 - 0.0145 * (d - 70)
      case d <= 110:
        return 0.46 - 0.0035 * (d - 90)
      case d <= 270:
        return 0.39 - 0.00081 * (d - 110)
      case d <= 500:
        return 0.26 - 0.00048 * (d - 270)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.LongPistol]: (d) => {
    switch (true) {
      /*Long Pistol Ammo Damage Drop off*/
      case d <= 20:
        return 1
      case d <= 35:
        return 1 - 0.006 * (d - 20)
      case d <= 60:
        return 0.91 - 0.0096 * (d - 35)
      case d <= 80:
        return 0.67 - 0.006 * (d - 60)
      case d <= 100:
        return 0.55 - 0.003 * (d - 80)
      case d <= 120:
        return 0.49 - 0.007 * (d - 100)
      case d <= 500:
        return 0.35 - 0.00066 * (d - 120)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.LongPistolFMJ]: (d) => {
    switch (true) {
      /*Long Pistol FMJ Ammo Damage Drop off*/
      case d <= 30:
        return 1
      case d <= 45:
        return 1 - 0.006 * (d - 30)
      case d <= 70:
        return 0.91 - 0.0096 * (d - 45)
      case d <= 90:
        return 0.67 - 0.006 * (d - 70)
      case d <= 110:
        return 0.55 - 0.003 * (d - 90)
      case d <= 130:
        return 0.49 - 0.007 * (d - 110)
      case d <= 500:
        return 0.35 - 0.00068 * (d - 130)
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.Nitro]: (d) => {
    switch (true) {
      /*Nitro Ammo Damage Drop off*/
      case d <= 10:
        return 1
      case d <= 25:
        return 1 - 0.023333333 * (d - 10)
      case d <= 40:
        return 0.65 - 0.014666667 * (d - 25)
      case d <= 70:
        return 0.43 - 0.006 * (d - 40)
      case d <= 100:
        return 0.25 - 0.001666667 * (d - 70)
      case d <= 250:
        return 0.2
      case d > 250:
        return 0.1
      default:
        throw new Error("Unreachable")
    }
  },
  [AmmoTypeName.Shotgun]: (d) => {
    const dropoff = [
      [-1, 1],
      [5, 1],
      [10, 0.87],
      [15, 0.755],
      [20, 0.5],
      [25, 0.25],
      [30, 0.1],
      [35, 0.07],
      [40, 0.05],
      [45, 0],
    ]

    // If the distance is greater than 40, then the damage is 0
    if (d > 40) {
      return 0
    }

    // Find the two points that the distance is between
    let i = 0
    while (i < dropoff.length - 1 && d > dropoff[i][0]) {
      i++
    }

    const coord1 = dropoff[i - 1]
    const coord2 = dropoff[i]
    if (!coord1 || !coord2) {
      return 0
    }

    // Calculate the percent of damage at the distance
    const [x1, y1] = coord1
    const [x2, y2] = coord2
    const m = (y2 - y1) / (x2 - x1)
    const b = y1 - m * x1

    return m * d + b
  },
}

enum BodypartDamageModifier {
  HeadCompact = 4.62,
  HeadMedium = 3.85,
  HeadLong = 3.08,
  UpperChest = 1,
  Gut = 0.77,
  Arms = 0.615,
  Legs = 0.538,
}

interface IGun {
  name: string
  damage: number
  flags: AmmoFlags
  variants?: AmmoFlags
}

// prettier-ignore
const GUNS_NEW: IGun[] = [
  { name: "Berthier MLE 1892",                 damage: 130,       flags: AmmoFlags.Long,                               variants: AmmoFlags.Spitzer                  },
  { name: "Bornheim No. 3",                    damage:  74,       flags: AmmoFlags.Compact | AmmoFlags.Pistol,         variants: AmmoFlags.Silenced                 },
  { name: "Caldwell 92 New Army",              damage:  97,       flags: AmmoFlags.Compact | AmmoFlags.Pistol,         variants: AmmoFlags.FMJ                      },
  { name: "Caldwell Conversion Pistol",        damage: 104,       flags: AmmoFlags.Compact | AmmoFlags.Pistol,         variants: AmmoFlags.FMJ                      },
  { name: "Caldwell Conversion Uppercut",      damage: 126,       flags: AmmoFlags.Long    | AmmoFlags.Pistol                                                       },
  { name: "Caldwell Pax",                      damage: 110,       flags: AmmoFlags.Medium  | AmmoFlags.Pistol,         variants: AmmoFlags.FMJ                      },
  { name: "Caldwell Rival 78",                 damage: 190,       flags: AmmoFlags.Shotgun                                                                          },
  { name: "Caldwell Rival 78 Handcannon",      damage: 105,       flags: AmmoFlags.Shotgun                                                                          },
  { name: "Crown & King Auto-5",               damage: 194,       flags: AmmoFlags.Shotgun                                                                          },
  { name: "Drilling",                          damage: 120,       flags: AmmoFlags.Medium,                             variants: AmmoFlags.FMJ                      },
  { name: "Lebel 1886",                        damage: 132,       flags: AmmoFlags.Long,                               variants: AmmoFlags.Spitzer                  },
  { name: "LeMat Mark II Carbine",             damage: 107,       flags: AmmoFlags.Medium,                             variants: AmmoFlags.FMJ                      },
  { name: "LeMat Mark II Revolver",            damage:  97,       flags: AmmoFlags.Medium  | AmmoFlags.Pistol,         variants: AmmoFlags.FMJ                      },
  { name: "LeMat Mark II UpperMat",            damage: 120,       flags: AmmoFlags.Long    | AmmoFlags.Pistol,         variants: AmmoFlags.FMJ                      },
  { name: "Martini-Henry IC1",                 damage: 143,       flags: AmmoFlags.Long,                               variants: AmmoFlags.FMJ                      },
  { name: "Mosin-Nagant M1891",                damage: 136,       flags: AmmoFlags.Long,                               variants: AmmoFlags.Spitzer                  },
  { name: "Mosin-Nagant M1891 Obrez",          damage: 133,       flags: AmmoFlags.Long,                               variants: AmmoFlags.Spitzer                  },
  { name: "Nagant M1895",                      damage:  91,       flags: AmmoFlags.Compact | AmmoFlags.Pistol,         variants: AmmoFlags.Silenced                 },
  { name: "Nagant M1895 Officer",              damage:  91,       flags: AmmoFlags.Compact | AmmoFlags.Pistol                                                       },
  { name: "Nagant M1895 Officer Carbine",      damage: 104,       flags: AmmoFlags.Compact                                                                          },
  { name: "Nitro Express Rifle",               damage: 364,       flags: AmmoFlags.Nitro                                                                            },
  { name: "Romero 77",                         damage: 218,       flags: AmmoFlags.Shotgun                                                                          },
  { name: "Romero 77 Handcannon",              damage: 145,       flags: AmmoFlags.Shotgun                                                                          },
  { name: "Scottfield Model 3",                damage: 107,       flags: AmmoFlags.Medium  | AmmoFlags.Pistol,         variants: AmmoFlags.FMJ                      },
  { name: "Sparks LRR",                        damage: 149,       flags: AmmoFlags.Long,                               variants: AmmoFlags.FMJ | AmmoFlags.Silenced },
  { name: "Sparks LRR Pistol",                 damage: 149,       flags: AmmoFlags.Long    | AmmoFlags.Pistol,         variants: AmmoFlags.FMJ                      },
  { name: "Specter 1882",                      damage: 210,       flags: AmmoFlags.Shotgun                                                                          },
  { name: "Specter 1882 Compact",              damage: 113,       flags: AmmoFlags.Compact                                                                          },
  { name: "Springfield 1866",                  damage: 132,       flags: AmmoFlags.Medium                                                                           },
  { name: "Springfield 1866 Compact",          damage: 130,       flags: AmmoFlags.Medium                                                                           },
  { name: "Springfield M1892 Krag",            damage: 124,       flags: AmmoFlags.Long,                               variants: AmmoFlags.FMJ                      },
  { name: "Vetterli 71 Karabiner",             damage: 130,       flags: AmmoFlags.Medium,                             variants: AmmoFlags.FMJ | AmmoFlags.Silenced },
  { name: "Vetterli 71 Karabiner Cyclone",     damage: 124,       flags: AmmoFlags.Medium,                             variants: AmmoFlags.FMJ                      },
  { name: "Winfield 1887 Terminus",            damage: 190,       flags: AmmoFlags.Shotgun                                                                          },
  { name: "Winfield 1887 Terminus Handcannon", damage: 105,       flags: AmmoFlags.Shotgun                                                                          },
  { name: "Winfield 1893 Slate",               damage: 203,       flags: AmmoFlags.Shotgun                                                                          },
  { name: "Winfield M1873",                    damage: 110,       flags: AmmoFlags.Compact,                            variants: AmmoFlags.FMJ                      },
  { name: "Winfield M1873C",                   damage: 110,       flags: AmmoFlags.Compact,                            variants: AmmoFlags.FMJ | AmmoFlags.Silenced },
  { name: "Winfield M1873C Vandal",            damage: 107,       flags: AmmoFlags.Compact,                            variants: AmmoFlags.FMJ                      },
  { name: "Winfield M1876 Centennial",         damage: 123,       flags: AmmoFlags.Medium,                             variants: AmmoFlags.FMJ                      },
  { name: "Winfield M1876 Centennial Shorty",  damage: 120,       flags: AmmoFlags.Medium,                             variants: AmmoFlags.FMJ | AmmoFlags.Silenced },
]

class IGunMethods {
  public static canEnableVariant(gun: IGun, variant: AmmoFlags): boolean {
    if (!gun.variants) {
      return false
    }
    return (gun.variants & variant) === variant
  }

  public static getDamageAtDistance(
    gun: IGun,
    variantFlags: AmmoFlags,
    distance: number,
    bodypartModifier: BodypartDamageModifier
  ): number {
    const flags = gun.flags | variantFlags
    const ammoType = AMMO_FLAGS_TO_TYPE[flags]
    const getDamageAtDistance = AMMO_TYPE_TO_DAMAGE_AT_DISTANCE[ammoType]
    const damage = getDamageAtDistance(distance) * gun.damage * bodypartModifier
    return Math.round(damage)
  }
}

interface PenetrationData {
  None: 100
  "1 Wooden Wall": number
  "2 Wooden Walls": number
  "3 Wooden Walls": number
  "1 Metal wall": number
  "1 Metal + 1 Wood": number
  "2 Metal Walls": number
  "4 Wooden Walls": number
  "5 Wooden Walls": number
  "6 Wooden Walls": number
  "7 Wooden Walls": number
  "Small Tree": number
  "Large Tree": number
  "1 Brick": number
  "Thick Brick": number
}

const AMMO_FLAGS_TO_PENETRATION: Partial<Record<AmmoFlags, PenetrationData>> = {
  [AmmoFlags.Shotgun]: {
    None: 100,
    "1 Wooden Wall": 100,
    "2 Wooden Walls": 0,
    "3 Wooden Walls": 0,
    "1 Metal wall": 0,
    "1 Metal + 1 Wood": 0,
    "2 Metal Walls": 0,
    "4 Wooden Walls": 0,
    "5 Wooden Walls": 0,
    "6 Wooden Walls": 0,
    "7 Wooden Walls": 0,
    "Small Tree": 0,
    "Large Tree": 0,
    "1 Brick": 0,
    "Thick Brick": 0,
  },
  [AmmoFlags.Compact]: {
    None: 100,
    "1 Wooden Wall": 100,
    "2 Wooden Walls": 40,
    "3 Wooden Walls": 0,
    "1 Metal wall": 0,
    "1 Metal + 1 Wood": 0,
    "2 Metal Walls": 0,
    "4 Wooden Walls": 0,
    "5 Wooden Walls": 0,
    "6 Wooden Walls": 0,
    "7 Wooden Walls": 0,
    "Small Tree": 0,
    "Large Tree": 0,
    "1 Brick": 0,
    "Thick Brick": 0,
  },
  [AmmoFlags.Compact | AmmoFlags.FMJ]: {
    None: 100,
    "1 Wooden Wall": 100,
    "2 Wooden Walls": 100,
    "3 Wooden Walls": 49,
    "1 Metal wall": 100,
    "1 Metal + 1 Wood": 49,
    "2 Metal Walls": 49,
    "4 Wooden Walls": 34,
    "5 Wooden Walls": 0,
    "6 Wooden Walls": 0,
    "7 Wooden Walls": 0,
    "Small Tree": 100,
    "Large Tree": 0,
    "1 Brick": 100,
    "Thick Brick": 0,
  },
  [AmmoFlags.Medium]: {
    None: 100,
    "1 Wooden Wall": 100,
    "2 Wooden Walls": 80,
    "3 Wooden Walls": 0,
    "1 Metal wall": 0,
    "1 Metal + 1 Wood": 0,
    "2 Metal Walls": 0,
    "4 Wooden Walls": 0,
    "5 Wooden Walls": 0,
    "6 Wooden Walls": 0,
    "7 Wooden Walls": 0,
    "Small Tree": 0,
    "Large Tree": 0,
    "1 Brick": 0,
    "Thick Brick": 0,
  },
  [AmmoFlags.Medium | AmmoFlags.FMJ]: {
    None: 100,
    "1 Wooden Wall": 100,
    "2 Wooden Walls": 100,
    "3 Wooden Walls": 89,
    "1 Metal wall": 100,
    "1 Metal + 1 Wood": 90,
    "2 Metal Walls": 89,
    "4 Wooden Walls": 65,
    "5 Wooden Walls": 0,
    "6 Wooden Walls": 0,
    "7 Wooden Walls": 0,
    "Small Tree": 100,
    "Large Tree": 0,
    "1 Brick": 100,
    "Thick Brick": 0,
  },
  [AmmoFlags.Long]: {
    None: 100,
    "1 Wooden Wall": 100,
    "2 Wooden Walls": 90,
    "3 Wooden Walls": 49,
    "1 Metal wall": 100,
    "1 Metal + 1 Wood": 0,
    "2 Metal Walls": 0,
    "4 Wooden Walls": 0,
    "5 Wooden Walls": 0,
    "6 Wooden Walls": 0,
    "7 Wooden Walls": 0,
    "Small Tree": 100,
    "Large Tree": 0,
    "1 Brick": 100,
    "Thick Brick": 0,
  },
  [AmmoFlags.Long | AmmoFlags.FMJ]: {
    None: 100,
    "1 Wooden Wall": 100,
    "2 Wooden Walls": 100,
    "3 Wooden Walls": 90,
    "1 Metal wall": 100,
    "1 Metal + 1 Wood": 90,
    "2 Metal Walls": 90,
    "4 Wooden Walls": 64,
    "5 Wooden Walls": 50,
    "6 Wooden Walls": 0,
    "7 Wooden Walls": 0,
    "Small Tree": 100,
    "Large Tree": 0,
    "1 Brick": 100,
    "Thick Brick": 0,
  },
  [AmmoFlags.Long | AmmoFlags.Spitzer]: {
    None: 100,
    "1 Wooden Wall": 100,
    "2 Wooden Walls": 100,
    "3 Wooden Walls": 94,
    "1 Metal wall": 100,
    "1 Metal + 1 Wood": 94,
    "2 Metal Walls": 94,
    "4 Wooden Walls": 79,
    "5 Wooden Walls": 64,
    "6 Wooden Walls": 0,
    "7 Wooden Walls": 0,
    "Small Tree": 100,
    "Large Tree": 0,
    "1 Brick": 100,
    "Thick Brick": 0,
  },
  [AmmoFlags.Nitro]: {
    None: 100,
    "1 Wooden Wall": 100,
    "2 Wooden Walls": 100,
    "3 Wooden Walls": 100,
    "1 Metal wall": 48,
    "1 Metal + 1 Wood": 24,
    "2 Metal Walls": 43,
    "4 Wooden Walls": 43,
    "5 Wooden Walls": 21,
    "6 Wooden Walls": 19,
    "7 Wooden Walls": 9,
    "Small Tree": 100,
    "Large Tree": 100,
    "1 Brick": 100,
    "Thick Brick": 100,
  },
}

const PENETRATION_NAMES = Object.keys(AMMO_FLAGS_TO_PENETRATION[AmmoFlags.Compact]!!) as (keyof PenetrationData)[]

enum SelectableBodypart {
  Head = "Head",
  UpperChest = "Upper Chest",
  Gut = "Gut",
  Legs = "Legs",
  Arms = "Arms",
}

function GunsThatCanKillInShotsAtDistance() {
  const [distance, setDistance] = useState(50)
  const [health, setHealth] = useState(125)
  const [bodypart, setBodypart] = useState<SelectableBodypart>(SelectableBodypart.UpperChest)
  const [penetratedObject, setPenetratedObject] = useState<keyof PenetrationData>("None")

  const gunsThatCanKill = GUNS_NEW.flatMap((gun) => {
    const baseFlags = gun.flags
    const variantFlags = gun.variants ?? 0
    const flagCombinations: AmmoFlags[] = [baseFlags]

    // Generate all flag combinations
    for (let flag = 1; flag <= variantFlags; flag <<= 1) {
      if (variantFlags & flag) {
        flagCombinations.push(...flagCombinations.map((f) => f | flag))
      }
    }

    // Filter flag combinations that can kill in one shot
    return flagCombinations.flatMap((combination) => {
      const bodypartModifier = mapSelectedBodypartAndCurrentGunFlagsToModifier(bodypart, combination)
      const damage = IGunMethods.getDamageAtDistance(gun, combination, distance, bodypartModifier)
      const penetratedDamage = damage * getPenetrationModifier(penetratedObject, combination)
      const shotsToKill = Math.ceil(health / penetratedDamage)
      if (shotsToKill <= 1) {
        return {
          name: gun.name,
          flags: AMMO_FLAGS_TO_TYPE[combination],
          damage: damage,
        }
      }
      return []
    })
  })

  return (
    <div className="guns-that-can-kill">
      <div>
        <label htmlFor="bodypart" style={{ marginBottom: 10 }}>
          Bodypart:
        </label>
        <select
          value={bodypart}
          onChange={(e) => {
            setBodypart(e.target.value as SelectableBodypart)
          }}
        >
          {Object.entries(SelectableBodypart).map(([key, value]) => (
            <option key={key} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {(function PenetrationSelectList() {
        return (
          <div>
            <label htmlFor="penetratedObject">Penetrated Object:</label>
            <select
              id="penetratedObject"
              value={penetratedObject}
              onChange={(e) => setPenetratedObject(e.target.value as keyof PenetrationData)}
            >
              {PENETRATION_NAMES.map((obj) => (
                <option key={obj} value={obj}>
                  {obj}
                </option>
              ))}
            </select>
          </div>
        )
      })()}

      <div>
        <label htmlFor="distance">Distance ({distance}):</label>
        <input
          id="distance"
          type="range"
          min={10}
          max={200}
          step={5}
          value={distance}
          onChange={(e) => setDistance(parseInt(e.target.value))}
        />
      </div>

      <div>
        <label htmlFor="health">Target Damage ({health}):</label>
        <input
          id="health"
          type="range"
          min={1}
          max={150}
          step={1}
          value={health}
          onChange={(e) => setHealth(parseInt(e.target.value))}
        />
      </div>

      <h3>
        Guns that can do{" "}
        <span style={{ color: "#DA3F3D" }}>
          <u>{health}</u>
        </span>{" "}
        damage at{" "}
        <span style={{ color: "goldenrod" }}>
          <u>{distance}m</u>
        </span>{" "}
        to the{" "}
        <span style={{ color: "cornflowerblue" }}>
          <u>{bodypart}</u>
        </span>{" "}
        through{" "}
        <span style={{ color: "green" }}>
          <u>{penetratedObject}</u>
        </span>
      </h3>

      <ul>
        {gunsThatCanKill.map((gun, index) => (
          <li key={`${gun.name}-${index}`}>
            {gun.name} <i>({gun.flags})</i> (<span style={{ color: "#DA3F3D" }}>{gun.damage}</span>)
          </li>
        ))}
      </ul>
    </div>
  )
}

function mapSelectedBodypartAndCurrentGunFlagsToModifier(
  selectedBodypart: SelectableBodypart,
  currentFlags: AmmoFlags
): BodypartDamageModifier {
  switch (selectedBodypart) {
    case SelectableBodypart.Head: {
      switch (true) {
        case (currentFlags & AmmoFlags.Compact) === AmmoFlags.Compact:
          return BodypartDamageModifier.HeadCompact
        case (currentFlags & AmmoFlags.Medium) === AmmoFlags.Medium:
          return BodypartDamageModifier.HeadMedium
        case (currentFlags & AmmoFlags.Long) === AmmoFlags.Long:
          return BodypartDamageModifier.HeadLong
        default:
          throw new Error("Unreachable")
      }
    }
    case SelectableBodypart.UpperChest:
      return BodypartDamageModifier.UpperChest
    case SelectableBodypart.Gut:
      return BodypartDamageModifier.Gut
    case SelectableBodypart.Arms:
      return BodypartDamageModifier.Arms
    case SelectableBodypart.Legs:
      return BodypartDamageModifier.Legs
  }
}

function canEnableVariant(gun: IGun, variant: AmmoFlags): boolean {
  if (!gun.variants) {
    return false
  }
  return (gun.variants & variant) === variant
}

enum ViewType {
  DamageGraph = "Damage Graph",
  FindWeapon = "Find Weapon",
}

function App() {
  const [maxDistance, setMaxDistance] = useState(100)
  const [bodypart, setBodypart] = useState<SelectableBodypart>(SelectableBodypart.UpperChest)
  const [gun, setGun] = useState(GUNS_NEW[0])
  const [variant, setVariant] = useState(gun.flags)
  const [penetratedObject, setPenetratedObject] = useState<keyof PenetrationData>("None")
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DamageGraph)

  useEffect(() => setVariant(gun.flags), [gun])
  useEffect(() => {
    // If current gun is shotgun, set distance to 40
    if (gun.flags & AmmoFlags.Shotgun) {
      setMaxDistance(40)
    } else {
      // If we currently have a shotgun max distance, set it to 100 default
      // Otherwise, leave it alone
      if (maxDistance === 40) {
        setMaxDistance(100)
      }
    }
  }, [gun])

  const bodypartModifier = mapSelectedBodypartAndCurrentGunFlagsToModifier(bodypart, variant)

  return (
    <div className="App">
      <div className="github-link">
        <a href="https://github.com/GavinRay97/hunt-damage-calculator" target="_blank" rel="noreferrer">
          View on GitHub
        </a>
      </div>

      <div className="select-mode">
        <span>Select Mode:</span>
        <br />
        <button
          className={`button ${currentView === ViewType.DamageGraph ? "button-active" : ""}`}
          onClick={() => setCurrentView(ViewType.DamageGraph)}
        >
          Damage Graph
        </button>
        <button
          className={`button ${currentView === ViewType.FindWeapon ? "button-active" : ""}`}
          onClick={() => setCurrentView(ViewType.FindWeapon)}
        >
          Find Weapon
        </button>
      </div>

      {(() => {
        switch (currentView) {
          case ViewType.DamageGraph:
            return (
              <>
                <header className="App-header">
                  <h1>Hunt: Showdown Damage Calculator</h1>

                  <div>
                    <label htmlFor="bodypart">Bodypart:</label>
                    <select
                      id="bodypart"
                      value={bodypart}
                      onChange={(e) => setBodypart(e.target.value as SelectableBodypart)}
                    >
                      {Object.entries(SelectableBodypart).map(([key, value]) => (
                        <option key={key} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="gun">Gun:</label>
                    <select
                      id="gun"
                      value={gun.name}
                      onChange={(e) => setGun(GUNS_NEW.find((g) => g.name === e.target.value)!)}
                    >
                      {GUNS_NEW.map((g) => (
                        <option key={g.name} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {(function PenetrationSelectList() {
                    return (
                      <div>
                        <label htmlFor="penetratedObject">Penetrated Object:</label>
                        <select
                          id="penetratedObject"
                          value={penetratedObject}
                          onChange={(e) => setPenetratedObject(e.target.value as keyof PenetrationData)}
                        >
                          {PENETRATION_NAMES.map((obj) => (
                            <option key={obj} value={obj}>
                              {obj}
                            </option>
                          ))}
                        </select>
                      </div>
                    )
                  })()}

                  {/* Display checkbox to enable/disable variants like silenced and FMJ */}
                  {gun.variants && (
                    <div className="checkbox-container">
                      {canEnableVariant(gun, AmmoFlags.Silenced) && (
                        <>
                          <label className="checkbox-label" htmlFor="silenced">
                            Silenced:
                          </label>
                          <input
                            id="silenced"
                            type="checkbox"
                            checked={variant & AmmoFlags.Silenced ? true : false}
                            onChange={(e) => {
                              setVariant(
                                e.target.checked ? variant | AmmoFlags.Silenced : variant & ~AmmoFlags.Silenced
                              )
                            }}
                          />
                        </>
                      )}
                      {canEnableVariant(gun, AmmoFlags.FMJ) && (
                        <>
                          <label className="checkbox-label" htmlFor="fmj">
                            FMJ:
                          </label>
                          <input
                            id="fmj"
                            type="checkbox"
                            checked={variant & AmmoFlags.FMJ ? true : false}
                            onChange={(e) => {
                              setVariant(e.target.checked ? variant | AmmoFlags.FMJ : variant & ~AmmoFlags.FMJ)
                            }}
                          />
                        </>
                      )}
                    </div>
                  )}
                  {/* Max Distance Slider */}
                  <div>
                    <label htmlFor="maxDistance">Max Distance: {maxDistance}m</label>
                    <input
                      id="maxDistance"
                      type="range"
                      min={10}
                      max={200}
                      step={5}
                      value={maxDistance}
                      onChange={(e) => setMaxDistance(parseInt(e.target.value))}
                    />
                  </div>
                </header>

                <DamageChart
                  maxDistance={maxDistance}
                  chartDistanceIntervalMeters={(gun.flags & AmmoFlags.Shotgun) == AmmoFlags.Shotgun ? 1 : 5}
                  damageAtDistances={(() => {
                    const ammoType = AMMO_FLAGS_TO_TYPE[variant]
                    const getDamageAtDistance = AMMO_TYPE_TO_DAMAGE_AT_DISTANCE[ammoType]
                    const penetrationModifier = getPenetrationModifier(penetratedObject, variant)

                    console.log("Gun", gun.name, "Ammo Type", ammoType, "Penetration Modifier", penetrationModifier)

                    const interval = (gun.flags & AmmoFlags.Shotgun) == AmmoFlags.Shotgun ? 1 : 5
                    const damageAtDistances = [] as number[]
                    for (let i = 0; i <= maxDistance; i += interval) {
                      const dmg = gun.damage * getDamageAtDistance(i) * bodypartModifier
                      const penetratedDmg = Math.round(dmg * penetrationModifier)
                      damageAtDistances.push(Math.round(penetratedDmg))
                    }

                    return damageAtDistances
                  })()}
                  chartHealthBreakpoints={[
                    // Red
                    { start: 1000, end: 150, color: "rgba(255, 0, 0, 0.2)" },
                    // Vibrant Orange
                    { start: 149, end: 125, color: "rgba(255, 140, 0, 0.2)" },
                    // Vibrant Yellow
                    { start: 124, end: 75, color: "rgba(255, 255, 0, 0.2)" },
                    // Vibrant Green
                    { start: 74, end: 0, color: "rgba(0, 255, 0, 0.2)" },
                  ]}
                />
              </>
            )
          case ViewType.FindWeapon:
            return (
              <header className="App-header">
                <GunsThatCanKillInShotsAtDistance />
              </header>
            )
        }
      })()}

      <footer className="credits">
        <p>Developed by Gavin Ray</p>
        <p>
          Damage Formulas credit: &nbsp;{" "}
          <a href="https://hunt-tools.de/damage-calculator">https://hunt-tools.de/damage-calculator</a>
        </p>
        <p>
          Penetration Data credit: &nbsp;{" "}
          <a href="https://docs.google.com/spreadsheets/d/193PJptYUsa-62oUAv1kO9d4Yj69_kJItfjRSK383vl8/edit#gid=0">
            Cornf's Penetration Spreadsheet
          </a>
        </p>
      </footer>
    </div>
  )
}

function getPenetrationModifier(penetratedObject: keyof PenetrationData, variant: AmmoFlags) {
  return (() => {
    if (!penetratedObject) {
      return 1
    }

    const penetration = AMMO_FLAGS_TO_PENETRATION[variant]
    if (!penetration) {
      return 1
    }

    const penetrationValue = penetration[penetratedObject]
    if (penetrationValue == null || penetrationValue == undefined) {
      return 1
    }

    return penetrationValue / 100
  })()
}

function DamageChart({
  maxDistance,
  chartDistanceIntervalMeters,
  damageAtDistances,
  chartHealthBreakpoints,
}: {
  maxDistance: number
  chartDistanceIntervalMeters: number
  damageAtDistances: number[]
  chartHealthBreakpoints: Array<{ start: number; end: number; color: string }>
}) {
  const maxDamage = Math.max(...damageAtDistances)

  const healthBreakpointAnnotations = [] as AnnotationOptions[]

  // Find the bounds of the color for each breakpoint
  for (const { start, end, color } of chartHealthBreakpoints) {
    // Find the first distance where the damage is less than the start
    let startIndex = 0
    while (damageAtDistances[startIndex] > start) {
      startIndex++
    }

    // Find the last distance where the damage is less than the end
    let endIndex = startIndex
    while (damageAtDistances[endIndex] > end) {
      endIndex++
    }

    healthBreakpointAnnotations.push({
      type: "box",
      xMin: startIndex,
      xMax: endIndex,
      yMin: 0,
      yMax: maxDamage + 10,
      backgroundColor: color,
    })
  }

  const interval = chartDistanceIntervalMeters

  return (
    <div className="chart-container">
      <Line
        width={800}
        height={400}
        data={{
          labels: [...Array(maxDistance / interval + 1).keys()].map((i) => i * interval + `m`),
          datasets: [
            {
              // label: `Damage to ${bodypartName}`,
              data: damageAtDistances,
              borderColor: "rgb(255, 99, 132)",
              backgroundColor: "rgb(255, 99, 132)",
              fill: false,
              cubicInterpolationMode: "monotone",
              tension: 1,
              pointRadius: 2,
            },
          ],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            title: {
              display: true,
              text: "Damage at Distance",
              color: window.matchMedia("(prefers-color-scheme: dark)").matches ? "white" : "black",
            },
            annotation: {
              annotations: healthBreakpointAnnotations,
            },
          },
          scales: {
            y: {
              min: 0,
              max: maxDamage + 10,
            },
          },
        }}
      />
    </div>
  )
}

export default App
