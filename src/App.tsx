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
  Legs = 0.538,
}

class Gun {
  public name: string
  public damage: number
  public baseFlags: AmmoFlags
  public variantFlags?: AmmoFlags
  public currentFlags: AmmoFlags

  constructor(name: string, damage: number, baseFlags: AmmoFlags, variantFlags?: AmmoFlags) {
    this.name = name
    this.damage = damage
    this.baseFlags = baseFlags
    this.variantFlags = variantFlags
    this.currentFlags = baseFlags
  }

  public canEnableVariant(variant: AmmoFlags): boolean {
    if (!this.variantFlags) {
      return false
    }
    return (this.variantFlags & variant) === variant
  }
}

const GUNS: Gun[] = [
  new Gun("Berthier Mle 1892", 130, AmmoFlags.Long, AmmoFlags.Spitzer),
  new Gun("Bornheim No. 3", 74, AmmoFlags.Compact | AmmoFlags.Pistol, AmmoFlags.Silenced),
  new Gun("Caldwell 92 New Army", 97, AmmoFlags.Compact | AmmoFlags.Pistol, AmmoFlags.FMJ),
  new Gun("Caldwell Conversion Pistol", 104, AmmoFlags.Compact | AmmoFlags.Pistol, AmmoFlags.FMJ),
  new Gun("Caldwell Conversion Uppercut", 126, AmmoFlags.Long | AmmoFlags.Pistol),
  new Gun("Caldwell Pax", 110, AmmoFlags.Medium | AmmoFlags.Pistol, AmmoFlags.FMJ),
  new Gun("Caldwell Rival 78", 190, AmmoFlags.Shotgun),
  new Gun("Caldwell Rival 78 Handcannon", 105, AmmoFlags.Shotgun),
  new Gun("Crown & King Auto-5", 194, AmmoFlags.Shotgun),
  new Gun("Drilling", 120, AmmoFlags.Medium, AmmoFlags.FMJ),
  new Gun("Lebel 1886", 132, AmmoFlags.Long, AmmoFlags.Spitzer),
  new Gun("LeMat Mark II Carbine", 107, AmmoFlags.Medium, AmmoFlags.FMJ),
  new Gun("LeMat Mark II Revolver", 97, AmmoFlags.Medium | AmmoFlags.Pistol, AmmoFlags.FMJ),
  new Gun("LeMat Mark II UpperMat", 120, AmmoFlags.Long | AmmoFlags.Pistol, AmmoFlags.FMJ),
  new Gun("Martini-Henry IC1", 143, AmmoFlags.Long, AmmoFlags.FMJ),
  new Gun("Mosin-Nagant M1891", 136, AmmoFlags.Long, AmmoFlags.Spitzer),
  new Gun("Mosin-Nagant M1891 Obrez", 133, AmmoFlags.Long, AmmoFlags.Spitzer),
  new Gun("Nagant M1895", 91, AmmoFlags.Compact | AmmoFlags.Pistol, AmmoFlags.Silenced),
  new Gun("Nagant M1895 Officer", 91, AmmoFlags.Compact | AmmoFlags.Pistol),
  new Gun("Nagant M1895 Officer Carbine", 104, AmmoFlags.Compact),
  new Gun("Nitro Express Rifle", 364, AmmoFlags.Nitro),
  new Gun("Romero 77", 218, AmmoFlags.Shotgun),
  new Gun("Romero 77 Handcannon", 145, AmmoFlags.Shotgun),
  new Gun("Scottfield Model 3", 107, AmmoFlags.Medium | AmmoFlags.Pistol, AmmoFlags.FMJ),
  new Gun("Sparks LRR", 149, AmmoFlags.Long, AmmoFlags.FMJ | AmmoFlags.Silenced),
  new Gun("Sparks LRR Pistol", 149, AmmoFlags.Long | AmmoFlags.Pistol, AmmoFlags.FMJ),
  new Gun("Specter 1882", 210, AmmoFlags.Shotgun),
  new Gun("Specter 1882 Compact", 113, AmmoFlags.Compact),
  new Gun("Springfield 1866", 132, AmmoFlags.Medium),
  new Gun("Springfield 1866 Compact", 130, AmmoFlags.Medium),
  new Gun("Springfield M1892 Krag", 124, AmmoFlags.Long, AmmoFlags.FMJ),
  new Gun("Vetterli 71 Karabiner", 130, AmmoFlags.Medium, AmmoFlags.FMJ | AmmoFlags.Silenced),
  new Gun("Vetterli 71 Karabiner Cyclone", 124, AmmoFlags.Medium, AmmoFlags.FMJ),
  new Gun("Winfield 1887 Terminus", 190, AmmoFlags.Shotgun),
  new Gun("Winfield 1887 Terminus Handcannon", 105, AmmoFlags.Shotgun),
  new Gun("Winfield 1893 Slate", 203, AmmoFlags.Shotgun),
  new Gun("Winfield M1873", 110, AmmoFlags.Compact, AmmoFlags.FMJ),
  new Gun("Winfield M1873C", 110, AmmoFlags.Compact, AmmoFlags.FMJ | AmmoFlags.Silenced),
  new Gun("Winfield M1873C Vandal", 107, AmmoFlags.Compact, AmmoFlags.FMJ),
  new Gun("Winfield M1876 Centennial", 123, AmmoFlags.Medium, AmmoFlags.FMJ),
  new Gun("Winfield M1876 Centennial Shorty", 120, AmmoFlags.Medium, AmmoFlags.FMJ | AmmoFlags.Silenced),
]

const selectableBodyparts = ["Head", "Upper Chest", "Gut", "Legs"] as const

function mapSelectedBodypartAndCurrentGunFlagsToModifier(
  selectedBodypart: (typeof selectableBodyparts)[number],
  currentFlags: AmmoFlags
): BodypartDamageModifier {
  switch (selectedBodypart) {
    case "Head": {
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
    case "Upper Chest":
      return BodypartDamageModifier.UpperChest
    case "Gut":
      return BodypartDamageModifier.Gut
    case "Legs":
      return BodypartDamageModifier.Legs
  }
}

function App() {
  const [maxDistance, setMaxDistance] = useState(100)
  const [bodypart, setBodypart] = useState<(typeof selectableBodyparts)[number]>("Upper Chest")
  const [gun, setGun] = useState(GUNS[0])
  const [variant, setVariant] = useState(gun.baseFlags)

  useEffect(() => setVariant(gun.baseFlags), [gun])
  useEffect(() => {
    // If current gun is shotgun, set distance to 40
    if (gun.baseFlags & AmmoFlags.Shotgun) {
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
        <a href="https://github.com/yourusername/yourrepository" target="_blank" rel="noopener noreferrer">
          View on GitHub
        </a>
      </div>
      <header className="App-header">
        <h1>Hunt: Showdown Damage Calculator</h1>
        <div>
          <label htmlFor="bodypart">Bodypart:</label>
          <select
            id="bodypart"
            value={bodypart}
            onChange={(e) => setBodypart(e.target.value as (typeof selectableBodyparts)[number])}
          >
            {selectableBodyparts.map((bp) => (
              <option key={bp} value={bp}>
                {bp}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="gun">Gun:</label>
          <select id="gun" value={gun.name} onChange={(e) => setGun(GUNS.find((g) => g.name === e.target.value)!)}>
            {GUNS.map((g) => (
              <option key={g.name} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        {/* Display checkbox to enable/disable variants like silenced and FMJ */}
        {gun.variantFlags && (
          <>
            {gun.canEnableVariant(AmmoFlags.Silenced) && (
              <div>
                <label htmlFor="silenced">Silenced:</label>
                <input
                  id="silenced"
                  type="checkbox"
                  checked={variant & AmmoFlags.Silenced ? true : false}
                  onChange={(e) => {
                    setVariant(e.target.checked ? variant | AmmoFlags.Silenced : variant & ~AmmoFlags.Silenced)
                  }}
                />
              </div>
            )}
            {gun.canEnableVariant(AmmoFlags.FMJ) && (
              <div>
                <label htmlFor="fmj">FMJ:</label>
                <input
                  id="fmj"
                  type="checkbox"
                  checked={variant & AmmoFlags.FMJ ? true : false}
                  onChange={(e) => {
                    setVariant(e.target.checked ? variant | AmmoFlags.FMJ : variant & ~AmmoFlags.FMJ)
                  }}
                />
              </div>
            )}
          </>
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
        gunDamage={gun.damage}
        ammoType={AMMO_FLAGS_TO_TYPE[variant]}
        bodypartModifier={bodypartModifier}
        bodypartName={bodypart}
        maxDistance={maxDistance}
      />

      <footer className="credits">
        <p>Developed by Gavin Ray</p>
        <p>
          Damage Formulas credit: &nbsp;{" "}
          <a
            href="https://hunt-tools.de/damage-calculator"
            style={{ color: window.matchMedia("(prefers-color-scheme: dark)").matches ? "white" : "black" }}
          >
            https://hunt-tools.de/damage-calculator
          </a>
        </p>
      </footer>
    </div>
  )
}

// Render a Chart.js chart that shows the damage of the selected gun over a distance range
function DamageChart({
  gunDamage,
  ammoType,
  bodypartModifier,
  bodypartName,
  maxDistance,
}: {
  gunDamage: number
  ammoType: AmmoTypeName
  bodypartModifier: BodypartDamageModifier
  bodypartName: string
  maxDistance: number
}) {
  // If this gun is a Shotgun, we want to plot the damage at 1m intervals
  // Otherwise, plot the damage at 5m intervals
  const interval = ammoType === AmmoTypeName.Shotgun ? 1 : 5

  const getDamageAtDistance = AMMO_TYPE_TO_DAMAGE_AT_DISTANCE[ammoType]

  const damageAtDistanceData = [] as number[]
  for (let i = 0; i <= maxDistance; i += interval) {
    const dmg = gunDamage * getDamageAtDistance(i) * bodypartModifier
    damageAtDistanceData.push(Math.round(dmg))
  }

  // The color of the line at various points should represent the number of shots needed to kill a 150 health hunter
  // Use Chart.js plugin annotation to draw boxes that span the distance range for each color
  let healthBreakpointAnnotations: AnnotationOptions[] = []
  const healthBreakpointsWithColor = [
    // Red
    { start: 1000, end: 150, color: "rgba(255, 0, 0, 0.2)" },
    // Vibrant Orange
    { start: 149, end: 125, color: "rgba(255, 140, 0, 0.2)" },
    // Vibrant Yellow
    { start: 124, end: 75, color: "rgba(255, 255, 0, 0.2)" },
    // Vibrant Green
    { start: 74, end: 0, color: "rgba(0, 255, 0, 0.2)" },
  ] as const

  // Find the bounds of the color for each breakpoint
  for (const { start, end, color } of healthBreakpointsWithColor) {
    // Find the first distance where the damage is less than the start
    let startIndex = 0
    while (damageAtDistanceData[startIndex] > start) {
      startIndex++
    }

    // Find the last distance where the damage is less than the end
    let endIndex = startIndex
    while (damageAtDistanceData[endIndex] > end) {
      endIndex++
    }

    healthBreakpointAnnotations.push({
      type: "box",
      xMin: startIndex,
      xMax: endIndex,
      yMin: 0,
      yMax: gunDamage + 10,
      backgroundColor: color,
    })
  }

  return (
    <div className="chart-container">
      <Line
        width={800}
        height={400}
        data={{
          labels: [...Array(maxDistance / interval + 1).keys()].map((i) => i * interval + `m`),
          datasets: [
            {
              label: `Damage to ${bodypartName}`,
              data: damageAtDistanceData,
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
              max: gunDamage + 10,
            },
          },
        }}
      />
    </div>
  )
}

export default App
