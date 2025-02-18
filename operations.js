const processInstructions = {
    // Loading Operations
    "loading-Solid": {
      description: `Load required amount of [name] into Reactor 002-XX:
  1. Remove the secondary package and carefully open the primary package.
  2. Weigh the required amount of [name] using balance 007-XX into a jug [project/TP code].
  3. Load [name] into the Reactor via handhole using plastic scoop.
  4. Set stirring rate in reactor 002-XX to [XX-XX]rpm.
  5. Set Argon flow [XX-XX] L/min.
  6. Adjust pH to [XX-XX].
  
  Specified loading: ….. kg (range: …. - … kg)`
    },
    "loading-liquid <5L": {
      description: `Load required amount of [name] into Reactor 002-XX:
  1. Remove the secondary package and carefully open the primary package.
  2. Weigh the required amount of [name] using balance 007-XX into a jug [project/TP code].
  3. Pour [name] into the Reactor via handhole using plastic funnel [project/TP code].
  4. Set/keep stirring rate in reactor 002-XX to [XX-XX]rpm.
  5. Set/keep Argon flow [XX-XX] L/min.
  6. Adjust pH to [XX-XX].
  
  Specified loading: ….. kg (range: …. - … kg)`
    },
    "loading-liquid >5L": {
      description: `Load required amount of [name] into Reactor:
  1. Weigh the required amount of [name] using balance 007-XX.
  2. Connect peristaltic pump 001-XX and hose [project/TP code]. Set pump to [XX-XX]%.
  3. Using the peristaltic pump, load [name] into the reactor via the loading port.
  4. Set/keep stirring rate in reactor 002-XX to [XX-XX]rpm.
  5. Set/keep Argon flow [XX-XX] L/min.
  6. Adjust pH to [XX-XX].
  
  Specified loading: ….. kg (range: …. - … kg)`
    },
    "loading-dropwise addition": {
      description: `Load required amount of [name] into the dropping funnel of Reactor 002-XX:
  1. Remove the secondary package and carefully open the primary package.
  2. Weigh the required amount of [name] using balance 007-XX into a jug [project/TP code].
  3. Load [name] into the dropping funnel using a plastic funnel [project/TP code].
  4. Set stirring rate in reactor 002-XX to [XX-XX]rpm.
  5. Start drop-wise addition of [name] into the reactor.
  6. Keep temperature in the range [XX-XX]°C.
  7. Set/keep Argon flow [XX-XX] L/min.
  8. Adjust pH to [XX-XX].
  
  Specified loading: ….. kg (range: …. - … kg)`
    },
  
    // Additional Operations
  
    "heating/cooling": {
      description: `Perform a heating/cooling operation:
  1. Set temperature to [Set temp].
  2. Target temperature: [Target Temp].
  3. Monitor actual temperature: [Actual temperature].
  4. Adjust temperature rate to [temperature rate].
  5. Set stirring rate to [Stirring rate].
  6. Configure inert gas flow rate to [Inert gas flow rate].`
    },
    "hold time": {
      description: `Perform a hold time operation:
  1. Set temperature to [Set temp] with a target of [Target Temp].
  2. Monitor actual temperature: [Actual temperature].
  3. Adjust stirring rate to [Stirring rate].
  4. Hold for the duration: [Time].
  5. Set inert gas flow rate to [Inert gas flow rate].
  6. Maintain at the break point: [break point].`
    },
    "IPC": {
      description: `Perform an IPC operation:
  1. Use IPC Method: [IPC Method].
  2. Apply sample quenching: [Sample quenching].
  3. Expected Result: [Expected Result].
  4. On IPC failure, execute: [IPC Failure Action].
  5. On IPC pass, execute: [IPC Pass action].
  6. Estimated time for analysis: [Estim. Time of analysis].`
    },
    "evap.": {
      description: `Perform an evaporation operation:
  1. Set temperature to [Set temp] with a target of [Target Temp].
  2. Adjust pressure within range: [Pressure set range].
  3. Maintain stirring: [Stirring].
  4. Continue until end point is reached: [End point].
  5. Set inert gas flow rate to [Inert gas flow rate].
  6. Monitor and break at: [break point].`
    },
    "extr./separ.": {
      description: `Perform an extraction/separation operation:
  1. Operate for the expected time: [Exp. time].
  2. Monitor for the break point: [break point].`
    },
    "filtration": {
      description: `Perform a filtration operation:
  1. Set stirring rate to [Stirring rate].
  2. Target pressure: [Target pressure].
  3. Monitor actual pressure: [actual pressure].
  4. Continue until the end point is achieved: [End point].`
    },
    "filtration with candle filter": {
      description: `Perform a filtration operation using a candle filter:
  1. Set flow rate to [Flow rate].
  2. Continue until reaching the end point: [End point].`
    },
    "Washing FK": {
      description: `Perform a Washing FK operation:
  1. Use an amount of: [Amount].
  2. Ensure loaded material temperature is: [Loaded material temp.].
  3. Mix on filter as per instructions: [Mixing on filter].`
    },
    "Dry on filter": {
      description: `Perform a Dry on filter operation:
  1. Dry for the duration: [Time].
  2. Set target pressure to: [Target pressure].
  3. Consider air, moisture, and light sensitivity of the material.`
    },
    "drying in vac.": {
      description: `Perform a drying in vacuum operation:
  1. Set temperature to: [Set temp] with overheating protection: [overheating prot.].
  2. Apply vacuum at: [Vacuum].
  3. Ensure layer thickness is: [layer thickness].
  4. Mix/delump as needed: [mixing/delumping].
  5. Dry for the duration: [Time].`
    },
    "drying at atm.": {
      description: `Perform a drying at atmospheric pressure operation:
  1. Set temperature to: [Set temp] with overheating protection: [overheating prot.].
  2. Adjust fan setting within range: [fan set. Range].
  3. Set flap to: [flap set.].
  4. Ensure layer thickness is: [layer thickness].
  5. Mix/delump as necessary: [mixing/delumping].
  6. Dry for the duration: [Time].`
    },
    "centrifuging": {
      description: `Perform a centrifuging operation:
  1. Initiate with a loading spin at: [loading spin].
  2. Proceed with process spin at: [process spin].
  3. Process portion size: [portion size].`
    },
    "Hydrogenation/pressurized reaction": {
      description: `Perform a hydrogenation/pressurized reaction:
  1. Set temperature to: [Set temp] with a target of: [Target Temp].
  2. Adjust stirring to: [Stirring].
  3. Run the reaction for: [Time].
  4. Set hydrogen pressure to: [H2 pressure].`
    },
    "sieving": {
      description: `Perform a sieving operation:
  1. Use a sieve with size: [Sieve size].
  2. Process portion size: [portion size].
  3. Consider air, moisture, and light sensitivity of the material.`
    },
    "milling": {
      description: `Perform a milling operation:
  1. Use a mill of size: [mill size].
  2. Process portion size: [portion size].
  3. Mill for the duration: [Time].`
    },
    "packing": {
      description: `Perform a packing operation:
  1. Use analytical sample amount: [analytical sample amount].
  2. Retain sample amount: [ret. Sample amount.].
  3. Pack using: [packing material].
  4. Account for air, moisture, and light sensitivity of the material.`
    },
    "eq. cleaning": {
      description: `Perform equipment cleaning:
  1. Follow the solvent sequence: [solvent sequence].
  2. Estimated time required: [estim. time required].`
    },
    "waste treatment": {
      description: `Perform waste treatment:
  1. Process water waste: [water waste].
  2. Process organic waste: [organic waste].
  3. Process solid waste: [solid waste].`
    }
  };
  
  export {processInstructions};
  