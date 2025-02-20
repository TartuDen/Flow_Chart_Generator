//operations.js

const processInstructions = {
  // Loading Operations
  "loading-Solid": {
    description: `Load required amount of [name] into Reactor 002-XX:
1. Remove the secondary package and carefully open the primary package.
2. Weigh the required amount of [name] using balance 007-XX into a jug [project/TP code].
3. Load [name] into the Reactor via handhole using a plastic scoop.
4. Set stirring rate in reactor 002-XX to [Stirring].
5. Set inert gas flow rate to [Inert gas flow rate].
6. Adjust pH check to [pH check].
7. Set temperature to [Set temp].
8. Keep the temperature of reaction mixture in range: [Temp. of rm].
9. Note addition rate: [Addition rate].
10. Apply loading over time if needed: [Time].
11. (Optional) Verify loaded material temperature: [Loaded material temp.].

Specified loading: ….. kg (range: … - … kg)`
  },
  "loading-liquid <5L": {
    description: `Load required amount of [name] into Reactor 002-XX:
1. Remove the secondary package and carefully open the primary package.
2. Weigh the required amount of [name] using balance 007-XX into a jug [project/TP code].
3. Pour [name] into the Reactor via handhole using a plastic funnel [project/TP code].
4. Set/keep stirring rate in reactor 002-XX to [Stirring].
5. Set/keep inert gas flow rate to [Inert gas flow rate].
6. Adjust pH check to [pH check].
7. Set temperature to [Set temp].
8. Keep the temperature of reaction mixture in range:: [Temp. of rm].
9. Note addition rate: [Addition rate].
10. Apply loading over time if needed: [Time].
11. (Optional) Verify loaded material temperature: [Loaded material temp.].

Specified loading: ….. kg (range: … - … kg)`
  },
  "loading-liquid >5L": {
    description: `Load required amount of [name] into Reactor:
1. Weigh the required amount of [name] using balance 007-XX.
2. Connect peristaltic pump 001-XX and hose [project/TP code]; set pump to [Addition rate].
3. Using the peristaltic pump, load [name] via the loading port.
4. Set/keep stirring rate in reactor 002-XX to [Stirring].
5. Set/keep inert gas flow rate to [Inert gas flow rate].
6. Adjust pH check to [pH check].
7. Set temperature to [Set temp].
8. Keep the temperature of reaction mixture in range: [Temp. of rm].
9. Apply loading over time if needed: [Time].
10. (Optional) Verify loaded material temperature: [Loaded material temp.].

Specified loading: ….. kg (range: … - … kg)`
  },
  "loading-dropwise addition": {
    description: `Load required amount of [name] into the dropping funnel of Reactor 002-XX:
1. Remove the secondary package and carefully open the primary package.
2. Weigh the required amount of [name] using balance 007-XX into a jug [project/TP code].
3. Load [name] into the dropping funnel using a plastic funnel [project/TP code].
4. Set stirring rate in reactor 002-XX to [Stirring].
5. Start drop-wise addition of [name] into the reactor.
6. Maintain temperature within [Set temp]–[Target Temp] °C.
7. Set/keep inert gas flow rate to [Inert gas flow rate].
8. Adjust pH check to [pH check].
9. Note addition rate: [Addition rate].
10. Apply addition over time if needed: [Time].

Specified loading: ….. kg (range: … - … kg)`
  },
  
  // Reactor Preparation (if needed)
  "reactor prep.": {
    description: `Prepare the reactor:
1. Heat the reactor to [Heating to the temp.].
2. Hold the reactor at temperature for [hold time at temp].
3. Set Argon flow during heating to [Argon flow during heating].
4. Cool the reactor to [cooling to temp.].
5. Set Argon flow during cooling to [argon flow during cooling].`
  },
  
  // Packing (first instance)
  "packing": {
    description: `Perform a packing operation:
1. Use analytical sample amount: [analytical sample amount].
2. Retain sample amount: [ret. Sample amount.].
3. Pack using: [packing material].
4. Consider air, moisture, and light sensitivity of the material: [air, moisture, light sensitivity of the material].`
  },
  
  // Analyzing (QDQS)
  "Analyzing, correspond to QDQS": {
    description: `Perform the analysis according to QDQS:
1. If analysis result is YES, proceed accordingly.
2. If analysis result is NO, repeat necessary steps.`
  },
  
  // Equipment cleaning
  "eq. cleaning": {
    description: `Perform equipment cleaning:
1. Follow the solvent sequence: [solvent sequence].
2. Estimated time required: [estim. time required].`
  },
  
  // Waste treatment
  "waste treatment": {
    description: `Perform waste treatment:
1. Process water waste: [water waste].
2. Process organic waste: [organic waste].
3. Process solid waste: [solid waste].`
  },
  
  // Unloading
  "unloading": {
    description: `Perform an unloading operation:
1. Unload [name] using appropriate method: [method of transf.].
2. Measure unloaded amount: [Amount] kg.
3. Maintain stirring rate during unloading at [Stirring].
4. Set inert gas flow rate to [Inert gas flow rate].
5. Optional: Possible pause - [break point].`
  },
  
  // Heating/Cooling
  "heating/cooling": {
    description: `Perform a heating/cooling operation:
1. Set temperature to [Set temp].
2. Target temperature: [Target Temp].
3. Keep the temperature of reaction mixture in range: [Temp. of rm].
4. Adjust temperature rate to [temperature rate].
5. Set stirring rate to [Stirring].
6. Configure inert gas flow rate to [Inert gas flow rate].`
  },
  
  // Hold Time
  "hold time": {
    description: `Perform a hold time operation:
1. Set temperature to [Set temp] with target [Target Temp].
2. Keep the temperature of reaction mixture in range: [Temp. of rm].
3. Adjust stirring rate to [Stirring].
4. Hold for duration: [Time].
5. Set inert gas flow rate to [Inert gas flow rate].
6. Optional: Possible pause - [break point].`
  },
  
  // IPC
  "IPC": {
    description: `Perform an IPC operation:
1. Use IPC Method: [IPC Method].
2. Apply sample quenching: [Sample quenching].
3. Expected Result: [Expected Result].
4. On IPC failure, execute: [IPC Failure Action].
5. On IPC pass, execute: [IPC Pass action].
6. Estimated time for analysis: [Estim. Time of analysis].`
  },
  
  // Evaporation
  "evap.": {
    description: `Perform an evaporation operation:
1. Set temperature to [Set temp] with target [Target Temp].
2. Adjust pressure within range: [Pressure set range].
3. Maintain stirring at [Stirring].
4. Continue until end point: [End point].
5. Set inert gas flow rate to [Inert gas flow rate].
6. Optional: Possible pause - [break point].`
  },
  
  // Extraction/Separation
  "extr./separ.": {
    description: `Perform an extraction/separation operation:
1. Operate for expected time: [Exp. time].
2. Optional: Possible pause - [break point].`
  },
  
  // Filtration
  "filtration": {
    description: `Perform a filtration operation:
1. Set stirring rate to [Stirring].
2. Target pressure: [Target pressure].
3. Monitor actual pressure: [actual pressure].
4. Continue until end point: [End point].`
  },
  
  // Filtration with Candle Filter
  "filtration with candle filter": {
    description: `Perform a filtration operation using a candle filter:
1. Set flow rate to [Flow rate].
2. Continue until reaching end point: [End point].`
  },
  
  // Washing FK
  "washing FK": {
    description: `Perform a Washing Filter Cake operation:
1. Use required amount of [name] for washing Filter cake
2. Ensure loaded material temperature is [Loaded material temp.].
3. Mix on filter: [Mixing on filter].

Specified loading: ….. kg (range: … - … kg)`
  },
  
  // Dry on Filter
  "Dry on filter": {
    description: `Perform a Dry on filter operation:
1. Dry for the duration: [Time].
2. Set target pressure to [Target pressure].
3. Consider air, moisture, and light sensitivity of the material.`
  },
  
  // Drying in Vacuum
  "drying in vac.": {
    description: `Perform a drying in vacuum operation:
1. Set temperature to [Set temp] with overheating protection: [overheating prot.].
2. Apply vacuum at [Vacuum].
3. Ensure layer thickness is [layer thickness].
4. Mix/delump as needed: [mixing/delumping].
5. Dry for [Time].`
  },
  
  // Drying at Atmospheric Pressure
  "drying at atm.": {
    description: `Perform a drying at atmospheric pressure operation:
1. Set temperature to [Set temp] with overheating protection: [overheating prot.].
2. Adjust fan setting within range: [fan set. Range].
3. Set flap to [flap set.].
4. Ensure layer thickness is [layer thickness].
5. Mix/delump as necessary: [mixing/delumping].
6. Dry for [Time].`
  },
  
  // Centrifuging
  "centrifuging": {
    description: `Perform a centrifuging operation:
1. Initiate with loading spin at [loading spin].
2. Proceed with process spin at [process spin].
3. Process portion size: [portion size].`
  },
  
  // Hydrogenation/Pressurized Reaction
  "Hydrogenation/pressurized reaction": {
    description: `Perform a hydrogenation/pressurized reaction:
1. Set temperature to [Set temp] with target [Target Temp].
2. Adjust stirring to [Stirring].
3. Run the reaction for [Time].
4. Set hydrogen pressure to [H2 pressure].`
  },
  
  // Sieving
  "sieving": {
    description: `Perform a sieving operation:
1. Use a sieve with size [Sieve size].
2. Process portion size: [portion size].
3. Consider air, moisture, and light sensitivity of the material.`
  },
  
  // Milling
  "milling": {
    description: `Perform a milling operation:
1. Use a mill of size [mill size].
2. Process portion size: [portion size].
3. Mill for [Time].`
  },
  
  // (Repeat packing, eq. cleaning, and waste treatment if needed)
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

export { processInstructions };
