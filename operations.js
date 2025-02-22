//operations.js

const processInstructions = {
  // Loading Operations
  "loading-Solid": {
    description: `Load required amount of [name] into Reactor 002-XX:
1. Remove the secondary package and carefully open the primary package.
2. Weigh the required amount of [name] using balance 007-XX into a jug [project/TP code].
3. Load [name] into the Reactor via handhole using a plastic scoop [project/TP code].
4. Set/Keep stirring rate in reactor 002-XX to [Stirring].
5. Set/Keep inert gas flow rate to [Inert gas flow rate].
6. Adjust pH to: [pH check].
7. Set temperature on thermostat 011-XX to [Set temp].
8. Keep the temperature of reaction mixture in range: [Temp. of rm].
9. Addition is done - [Addition rate].
10. Loading is performed during: [Time].
11. Keep/Porvide temeprature of loaded material in range: [Loaded material temp.].
12. Optional: Possible pause - [break point].

Record required parameters into table XX.

Specified loading: ….. kg (range: … - … kg)`
  },
  "loading-liquid <5L": {
    description: `Load required amount of [name] into Reactor 002-XX:
1. Remove the secondary package and carefully open the primary package.
2. Weigh the required amount of [name] using balance 007-XX into a jug [project/TP code].
3. Pour [name] into the Reactor via handhole using a plastic funnel [project/TP code].
4. Set/Keep stirring rate in reactor 002-XX to [Stirring].
5. Set/Keep inert gas flow rate to [Inert gas flow rate].
6. Adjust pH to: [pH check].
7. Set temperature on thermostat 011-XX to [Set temp].
8. Keep the temperature of reaction mixture in range: [Temp. of rm].
9. Addition is done - [Addition rate].
10. Loading is performed during: [Time].
11. Keep/Porvide temeprature of loaded material in range: [Loaded material temp.].
12. Optional: Possible pause - [break point].

Record required parameters into table XX.

Specified loading: ….. kg (range: … - … kg)`
  },
  "loading-liquid >5L": {
    description: `Load required amount of [name] into Reactor:
1. Weigh the required amount of [name] using balance 007-XX.
2. Connect peristaltic pump 001-XX and hose [project/TP code].
3. Using the peristaltic pump, load [name] via the loading port.
4. Set/Keep stirring rate in reactor 002-XX to [Stirring].
5. Set/Keep inert gas flow rate to [Inert gas flow rate].
6. Adjust pH to: [pH check].
7. Set temperature on thermostat 011-XX to [Set temp].
8. Keep the temperature of reaction mixture in range: [Temp. of rm].
9. Addition is done - [Addition rate].
10. Loading is performed during: [Time].
11. Keep/Porvide temeprature of loaded material in range: [Loaded material temp.].
12. Optional: Possible pause - [break point].

Record required parameters into table XX.

Specified loading: ….. kg (range: … - … kg)`
  },
  "loading-dropwise addition": {
    description: `Load required amount of [name] into the dropping funnel of Reactor 002-XX:
1. Remove the secondary package and carefully open the primary package.
2. Weigh the required amount of [name] using balance 007-XX into a jug [project/TP code].
3. Load [name] into the dropping funnel using a plastic funnel [project/TP code].
4. Set/Keep stirring rate in reactor 002-XX to [Stirring].
5. Set/Keep inert gas flow rate to [Inert gas flow rate].
6. Adjust pH to: [pH check].
7. Set temperature on thermostat 011-XX to [Set temp].
8. Keep the temperature of reaction mixture in range: [Temp. of rm].
9. Addition is done - [Addition rate].
10. Loading is performed during: [Time].
11. Keep/Porvide temeprature of loaded material in range: [Loaded material temp.].
12. Optional: Possible pause - [break point].

Record required parameters into table XX.

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
    description: `Start a heating/cooling operation:
1. Open cooling water for heating/cooling circulator 011-XX
2. Set temperature on thermostat 011-XX to [Set temp].
3. Keep the temperature of reaction mixture in range: [Target Temp].
4. Provide temperature gradient: [cooling/heating grad.].
5. Set/Keep stirring rate to [Stirring].
6. Adjust inert gas flow rate to [Inert gas flow rate].

Record required parameters into table XX.`
  },
  
  // Hold Time
  "hold time": {
    description: `Start a hold time operation:
1. Set temperature on thermostat 011-XX to [Set temp].
2. Keep the temperature of reaction mixture in range: [Target Temp].
3. Adjust stirring rate to [Stirring].
4. Set inert gas flow rate to [Inert gas flow rate].
5. Hold for duration: [Time].
6. Optional: Possible pause - [break point].

Record required parameters into table XX.`
  },

    // IPC
    "Filter prep.": {
      description: `Filter 046-XX setup:
  1. Place a PTFE seal on filtrate receiver top edge.
  2.	Connect suspension receiver to filtrate receiver
  3.	Install filter cloth [Use filter cloth] into filter and fix it with the plastic ring.
  4.	Connect hose [project/TP code] to filtrate receiver vacuum valve. Connect other end of hose to a membrane pump 001-XX.
      Membrane pump 001-XX connected to receiver vacuum valve: 
      Filtration cloth is cut and installed properly: 
  `
    },

  // IPC
  "IPC": {
    description: `In-process control:
1. Use IPC Method: [IPC Method].
2. Apply sample quenching: [Sample quenching].
3. Expected Result: [Expected Result].
4. On IPC failure: [IPC Failure Action].
5. On IPC pass: [IPC Pass action].
6. Estimated time for analysis: [Estim. Time of analysis].`
  },
  
  // Evaporation
  "evap.": {
    description: `Perform an evaporation operation:
1. Set temperature on thermostat 011-XX to [Set temp] with target [Target Temp].
2. Connect the membrane pump via a cold trap and turn it ON.
3. Gradually reduce the pressure to reach approximately [Pressure set range]. Make sure the condenser is not overflooded with condensed solvent, adjust pressure accordingly.
4. Maintain stirring at [Stirring].
5. Continue until: [End point].
6. Set inert gas flow rate to [Inert gas flow rate].
7. Optional: Possible pause - [break point].

Record required parameters into table XX.`
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
1. Set the vacuum pump to [Pressure set] and start it.
2. Transfer the reaction mixture from the Reactor 001-XX to the Nutsch filter in portions, allowing filtration to proceed.
3. Record actula achieved pressure during filtration: [actual pressure].
4. Continue until: [End point]. Use a spoon [project/TP code] to press and remove cracks that might appear on filter cake.`
  },

  "Candle Filter prep.": {
    description: `Candle filter preparation:
1. Assemble the filter using the [filter size] cartridge and filter case.
2. Secure the case with the special key.
3. Connect Norprene hoses: attach the inlet to the larger pore side and the outlet to the smaller pore side.`
  },
  // Filtration with Candle Filter
  "filtration with candle filter": {
    description: `Perform a filtration operation using a candle filter:
1. Set flow rate to [Flow rate].
2. Continue until reaching end point: [End point].`
  },
  
  // Washing FK
  "Washing Filter cake": {
    description: `Perform a Washing Filter Cake operation:
1. Stop membrane pump 001-XX. 
2. Use required amount of [name] for washing Filter cake
3. Ensure loaded material temperature is [Loaded material temp.].
4. Mix on filter: [Mixing on filter].
5. Restart membrane pump and continue filtration.

Specified loading: ….. kg (range: … - … kg)`
  },
  
  // Dry on Filter
  "Dry on filter": {
    description: `Dry the filter cake on filter under vacuum:
1. After all material have been transferred on filter, maintain it on the filter under vacuum.
2.	Continue to apply vacuum [Pressure set] for [Time] to remove residual solvents.
3. Consider air, moisture, and light sensitivity of the material.
4. After finishing drying on filter, pump the filtrate from the filter into waste canister and weigh it.`
  },
  
  // Drying in Vacuum
  "drying in vac.": {
    description: `Dry the product in vacuum oven 012-XX:
1.	Check and record the tare mass of each tray into table XX.1. 
2.	Transfer the product (filter cake) onto trays with a layer thickness of [layer thickness].
3.	Place the trays in the vacuum oven.
4.	Connect vacuum pump to the oven via cold trap with dry ice.
5. Set overheating protection of the oven to: [overheating prot.].
6.	Set the oven temperature to; [Set temp] and start the pump with set: [Vacuum].
7.	Dry the product, checking the weight periodically (NLT 12h after start of drying) to determine dryness [Time].
8. Perform Mix/delump: [mixing/delumping].
`
  },
  
  // Drying at Atmospheric Pressure
  "drying at atm.": {
    description: `Perform a drying at atmospheric pressure operation:
1. Set temperature on thermostat 011-XX to [Set temp] with overheating protection: [overheating prot.].
2. Adjust fan setting within range: [fan set. Range].
3. Set flap to [flap set.].
4. Ensure layer thickness is [layer thickness].
5. Mix/delump as necessary: [mixing/delumping].
6. Dry for [Time].`
  },

    // Drying at Atmospheric Pressure
    "end of drying in oven": {
      description: `Finish drying:
  1. Save heating/cooling circulator 011-XX temperature logs on the USB stick that is inside the control panel or in the USB ports.
  2. Turn off membrane pump and repressurize the oven. Turn off the oven.
  3. Remove the trays from the oven and weigh them. Calculate loss on drying and fill Table X.
  4. Calculate process yield:
`
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
1. Set temperature on thermostat 011-XX to [Set temp] with target [Target Temp].
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
