//operations.js

const processInstructions = {
  // Loading Operations
  "loading-Solid": {
    description: `Load [name] into reactor 002-XX:
1. Remove secondary package and open primary package.
2. Weigh [name] on balance 007-XX into jug [project/TP code].
3. Load [name] into 002-XX via handhole using a plastic scoop [project/TP code].
4. Set/Adjust stirring rate in 002-XX to [Stirring].
5. Set/Adjust inert gas flow rate to [Inert gas flow rate].
6. Adjust pH to: [pH check].
7. Set/Adjust temperature on heating/cooling circulator 011-XX to [Set temp].
8. Keep reaction mixture temperature in range: [Temp. of rm].
9. Addition speed - [Addition rate].
10. Loading is performed during: [Time].
11. Keep/Provide temperature of loaded material in range: [Loaded material temp.].
12. Optional: Possible pause - [break point].

Fill Table X at least every Y minutes.

Specified loading: ….. kg (range: … - … kg)
`
  },
  "loading-liquid <5L": {
    description: `Load [name] into reactor 002-XX: 

1. Remove secondary package and open primary package.
2. Weigh [name] on balance 007-XX into jug [project/TP code].
3. Pour [name] into 002-XX via handhole using a plastic funnel [project/TP code].
4. Set/Adjust stirring rate in 002-XX to [Stirring].
5. Set/Adjust inert gas flow rate to [Inert gas flow rate].
6. Adjust pH to: [pH check].
7. Set/Adjust temperature on heating/cooling circulator 011-XX to [Set temp].
8. Keep reaction mixture temperature in range: [Temp. of rm].
9. Addition speed - [Addition rate].
10. Loading is performed during: [Time].
11. Keep/Provide temperature of loaded material in range: [Loaded material temp.].
12. Optional: Possible pause - [break point].

Fill Table X at least every Y minutes.

Specified loading: ….. kg (range: … - … kg)
`
  },
  "loading-liquid >5L": {
    description: `Load [name] into reactor 002-XX: 

1. Weigh [name] on balance 007-XX
2. Transfer [name] into 002-XX with peristaltic pump and hose [project/TP code].
3. Set/Adjust stirring rate in 002-XX to [Stirring].
4. Set/Adjust inert gas flow rate to [Inert gas flow rate].
5. Adjust pH to: [pH check].
6. Set/Adjust temperature on heating/cooling circulator 011-XX to [Set temp].
7. Keep reaction mixture temperature in range: [Temp. of rm].
8. Addition speed - [Addition rate].
9. Loading is performed during: [Time].
10. Keep/Provide temperature of loaded material in range: [Loaded material temp.].
11. Optional: Possible pause - [break point].

Fill Table X at least every Y minutes.

Specified loading: ….. kg (range: … - … kg)
`
  },
  "loading-dropwise addition": {
    description: `Load [name] into Reactor 002-XX dropping funnel: 

1. Remove secondary package and open primary package.
2. Weigh [name] on balance 007-XX into jug [project/TP code].
3. Load [name] into the dropping funnel using a plastic funnel [project/TP code].
4. Set/Adjust stirring rate in 002-XX to [Stirring].
5. Set/Adjust inert gas flow rate to [Inert gas flow rate].
6. Adjust pH to: [pH check].
7. Set/Adjust temperature on heating/cooling circulator 011-XX to [Set temp].
8. Keep reaction mixture temperature in range: [Temp. of rm].
9. Addition speed - [Addition rate].
10. Loading is performed during: [Time].
11. Keep/Provide temperature of loaded material in range: [Loaded material temp.].
12. Optional: Possible pause - [break point].

Fill Table X at least every Y minutes.

Specified loading: ….. kg (range: … - … kg)
`
  },

  "loading-suspend": {
    description: `Prepare suspension of [name1] in [name2] and load into Reactor 002-XX:
1. Weigh Materials:
  a. Weigh the required amount of [name1] using Balance 007-XX.
  b. Weigh the required amount of [name2] using Balance 007-XX.
2. Prepare Suspension:
  a. In a suitable container (5L jug), add the [name2].
  b. Slowly add [name1] into the [name2] while stirring to create a suspension.
  c. Ensure that the suspension is well mixed.
  d. Note: [name1] is a dusty product; wear appropriate personal protective equipment (PPE) including masks and protective clothing during handling.
3. Load Suspension into Reactor:
  a. Set/Adjust temperature on thermostat 011-XX to [Set temp].
  b. Keep the temperature of reaction mixture in range: [Target Temp].
  c. Set/Adjust inert gas flow rate to [Inert gas flow rate].
  d. Load the suspension into Reactor 002-XX by carefully pouring through a funnel "[project/TP code]" trying to minimize splashing and exposure.
4. Stirring:
  a. Set the stirring speed to [Stirring] (range is recommended and can be adjusted).
  b. Note: Ensure stirring is adequate to keep the suspension homogeneous.

Record required parameters into table XX every YY min.

Specified loading [name1]: ….. kg (range: … - … kg)

Specified loading [name2]: ….. kg (range: … - … kg)



Warehouse code of [name1]:
.........................
(eg. XXXX-XXX)
  
Actual loading of [name1]: 



Warehouse code of [name2]:
.........................
(eg. XXXX-XXX)
  
Actual loading of [name2]: 

`
  },
  
  // Reactor Preparation (if needed)
  "reactor prep.": {
    description: `Reactor 002-XX preparation:

1. Heat 002-XX to [Heating to the temp.].
2. Hold 002-XX at temperature for [hold time at temp].
3. Set Argon flow during heating to [Argon flow during heating].
4. Cool 002-XX to [cooling to temp.].
5. Set Argon flow during cooling to [Argon flow during cooling].
`
  },
  
  // Packing (first instance)
  "packing": {
    description: `Pack the product:
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
    description: `Clean the equipment:
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
    description: `Perform an unloading:
1. Unload [name] using appropriate method: [method of transf.].
2. Measure unloaded amount: [Amount] kg.
3. Maintain stirring rate during unloading at [Stirring] (range is recommended and can be adjusted).
4. Set/Adjust inert gas flow rate to [Inert gas flow rate].
5. Optional: Possible pause - [break point].`
  },

// decant
"decant": {
  description: `Decant liquid part from reactor 002-XX:
1. Set/Adjust heating/cooling circulator 011-XX to [Set temp].
2. Keep reaction mixture temperature in range: [Target Temp].
3. Turn off stirrer. Let precipitate settle on the bottom of reactor for [Time].
4. Set/Adjust inert gas flow rate to [Inert gas flow rate].
5. Optional: Possible pause - [break point].
6. After required time passed, pump liquid part (top layer) from reactor into “direction”. Use peristaltic pump and hose [project/TP code]. Peristaltic pump set: [Perist. Pump set].
7. Stop when [End point].
`
},
  
  // Heating/Cooling
  "heating/cooling": {
    description: `Start heating/cooling with heating/cooling circulator 011-XX:

1. Check that cooling water for 011-XX is opened.
2. Set/Adjust temperature on 011-XX to [Set temp].
3. Keep reaction mixture temperature in range: [Target Temp].
4. Provide temperature gradient: [cooling/heating grad.].
5. Set/Adjust stirring in reactor 002-XX to [Stirring].
6. Set/Adjust inert gas flow rate to [Inert gas flow rate].

Fill Table X at least every Y minutes.
`
  },
  
  // Hold Time
  "hold time": {
    description: `Start a hold time:

1. Set/Adjust heating/cooling circulator 011-XX to [Set temp].
2. Keep reaction mixture temperature in range: [Target Temp] for [Time].
3. Set/Adjust stirring in reactor 002-XX to [Stirring].
4. Set/Adjust inert gas flow rate to [Inert gas flow rate].
5. Optional: Possible pause - [break point].

Fill Table X at least every Y minutes.
`
  },

    "Filter prep.": {
      description: `Filter 046-6-7 setup:
  1. Place a PTFE seal on filtrate receiver top edge.
  2. Connect suspension receiver to filtrate receiver
  3. Install filter cloth into filter and fix it with the plastic ring.
  4. Connect hose "[project/TP code]" to filtrate receiver vacuum valve. Connect other end of hose to a membrane pump 001-XX.
      
  Membrane pump 001-XX connected to receiver vacuum valve: 
  Filtration cloth is cut and installed properly: 
  
  Filter 046-2-13 setup:
  1. Connect suspension receiver to glass receiver from reactor 002-XX with norprene hose "[project/TP code]".
  2. Connect reactor receiver to membrane pump 001-XX with norprene hose "vacuum".
  3. Install filter cloth into filter and fix it with the plastic ring.
      
  Filter is connected to Reactor's receiver vessel: 
  Membrane pump 001-XX is connected to Reactor's receiver vacuum valve: 
  Filtration cloth is cut and installed properly: 
  
  
  `
    },

  // IPC
  "IPC": {
    description: `In-process control:
In-process control (determination of IP.X conversion after [Sample taken in]):
1. Take approximately 1mL of reaction mixture into a 20 mL vial;
2. Sample is quenched: [Sample quenching].
3. Purge the vial with argon;
4. Label the sample with an IPC number. For example:
TBD-0XXX-Y IP.X RM IPC 1, where Y is the batch number (copied from the header) and X is the IPC serial number.
5. Submit the sample to QC for analysis.
6. Keep stirring the reaction mixture until the IPC result is available.
7. Estimated time for analysis: [Estim. Time of analysis]
Decision criteria based on IPC result:
•	If IP.X conversion is [Expected Result], proceed with the workup (Operation XX).
•	On IPC failure: [IPC Failure Action].
•	On IPC pass: [IPC Pass action].




IPC 1:
IPC no: 
TBD-0XXX-Y IP.X RM IPC 1
Results:
Corresponds to RelS requirements: 
 - Yes
 - No 
IP.X conversion:
..... %


`
  },
  // solution preparation
  "solution prep.": {
    description: `Prepare "description" solution according to table 1.X:
    Solution is prepared: 
`
  },
  // Evaporation from reactor
  "evap.": {
    description: `Start evaporation in reactor 002-XX:

1. Set/Adjust temperature heating/cooling circulator 011-XX to [Set temp] with target [Target Temp].
2. Connect a membrane pump via a cold trap and turn it ON.
3. Gradually reduce pressure [Pressure set range]. Make sure the condenser is not overflooded with condensed solvent, adjust pressure accordingly.
4. Set/Adjust stirring to [Stirring].
5. Continue until: [End point].
6. Set/Adjust inert gas flow rate to [Inert gas flow rate].
7. Optional: Possible pause - [break point].

Fill Table X at least every Y minutes.
`
  },

    // Evaporation from reactor
    "evap. Rota": {
      description: `Start evaporation in rotary evaporator 009-XX:

1. Check 009-XX bath level. Add more RO water if needed.
2. Connect and tighten flask [project/TP code] using a special key.
3. Set/Adjust bath temperature to [Set temp].
4. Turn ON condenser cooling water.
5. Connect membrane pump via a cold trap and turn it ON.
6. Gradually reduce the pressure within the range [Pressure set range]. Make sure the condenser is not overflooded with condensed solvent, adjust pressure accordingly.
7. Set/Adjust stirring to [Stirring].
8. Connect hose [project/TP code] for loading solution, open loading valve and load required amount of solution for evaporation.
9. Continue until: [End point].
10. Set/Adjust inert gas flow rate to [Inert gas flow rate].
11. Optional: Possible pause - [break point].

Fill Table X at least every Y minutes.
`
    },
  
  // Extraction/Separation
  "extr./separ.": {
    description: `Perform extraction/separation:
1. Set/Adjust stirring in reactor to [Stirring] (range is recommended and can be adjusted).
2. Mix layers for [Time].
3. Stop stirring and let layers completely separate (visual check). Expected time of separation [Exp. time].
4. Perform phase separation. Bottom "description" phase is stored into canister "[project/TP code]", top "description" layer  is stored in canister "[project/TP code]";

At the end layers clearly separated: Yes  / No 
(in case of No, inform PM)
`
  },
  
  // Filtration
  "filtration": {
    description: `Filter the material:
1. Keep stirring in Reactor 002-XX to 150-60rpm (gradually decreasing).
2. Connect norprene hose "[project/TP code]" from reactor valve and through peristaltic pump 001-XX to Nutsch filter 046-XX. Set the peristaltic pump to 40-60%.
3. Set the vacuum pump to [Pressure set] and start it.
4. Start peristaltic pump, open reactor’s valve and transfer the reaction mixture from the Reactor 002-XX to the Nutsch filter 046-XX in portions, allowing filtration to proceed.
5. Record actula achieved pressure during filtration: [actual pressure].
6. Continue until: [End point]. 
7. Use a spoon "[project/TP code]" to press and remove cracks that might appear on filter cake.

NB! Once Reactor’s receiver is 2/3 full, stop the process, release the vacuum from the system, connect filter outlet to atmosphere and empty filtrate into "[project/TP code]". Resume the process afterwards.`
  },

  "Candle Filter prep.": {
    description: `Candle filter preparation:
1. Assemble the filter using the [filter size] cartridge and filter case.
2. Secure the case with the special key.
3. Connect Norprene hoses: attach the inlet to the larger pore side and the outlet to the smaller pore side.`
  },
  // Filtration with Candle Filter
  "filtration with candle filter": {
    description: `Filter the reaction mass using candle filter:
1. Set flow rate to [Flow rate].
2. Continue until reaching end point: [End point].`
  },
  
  // Washing FK
  "Washing Filter cake": {
    description: `Wash filter cake with required amount of [name]:
1. Stop membrane pump 001-XX. Connect outlet to the atmosphere (to prevent filter cloth from floating).
2. Use required amount of [name] for washing Filter cake
3. Ensure loaded material temperature is [Loaded material temp.].
4. Mix on filter: [Mixing on filter].
5. Restart membrane pump and continue filtration.

Specified loading: ….. kg (range: … - … kg)`
  },
  
  // Dry on Filter
  "Dry on filter": {
    description: `Dry the filter cake on filter under vacuum:
1. Once Filter cake is visually dry, maintain it on the filter under vacuum.
2. Continue to apply vacuum [Pressure set] for [Time] to remove residual solvents.
3. Use a spoon "[project/TP code]" to press and remove cracks that might appear on filter cake.
4. Consider air, moisture, and light sensitivity of the material.
5. After finishing drying on filter, pump the filtrate from the filter into waste canister and weigh it.

m tara = ....... kg\n;
m gross weight = ....... kg\n;
m net "type of waste" waste = ....... kg\n; `
  },
  
  // Drying in Vacuum
  "drying in vac.": {
    description: `Dry the product in vacuum oven 012-XX:
1. Check and record the tare mass of each tray into table XX.1. 
2. Transfer the product (filter cake) onto trays with a layer thickness of [layer thickness]. Divide all wet product approximately evenly between all trays. Crush big lumps with shovel.
3. Place the trays in the vacuum oven.
4. Connect vacuum pump to the oven via cold trap with dry ice.
5. Set overheating protection of the oven to: [overheating prot.].
6. Set the oven temperature to; [Set temp] and start the pump with set: [Pressure set range].
7. Dry the product, checking the weight periodically (NLT 12h after start of drying) to determine dryness [Time]. In 2-3h weight loss should be less than 2-3%.
8. Perform Mix/delump: [mixing/delumping].

Record weights in Table X.

Table X filled: 

Overheating set: .......°C

Actual pressure after at least 1h from the start: ...... Torr

Temperature after at least 1h from the start: .......°C

`
  },
  
  // Drying at Atmospheric Pressure
  "drying at atm.": {
    description: `Dry the product in oven 012-XX:
1. Check and record the tare mass of each tray into table XX.1. 
2. Transfer the product (filter cake) onto trays with a layer thickness of [layer thickness]. Divide all wet product approximately evenly between all trays. Crush big lumps with shovel.
3. Place the trays in the oven.
4. Set temperature of the oven to [Set temp] with overheating protection: [overheating prot.].
5. Adjust fan to: [fan set.].
6. Set flap to [flap set.].
7. Dry the product, checking the weight periodically (NLT 12h after start of drying) to determine dryness [Time].
8. Perform Mix/delump: [mixing/delumping].

Record weights in Table X.

Table X filled: 

Overheating set: .......°C

Actual fan set: .......%;

Actual flap set: .......%;

Temperature after at least 1h from the start: .......°C

`
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
    description: `Perform a centrifuging:
1. Initiate with loading spin at [loading spin].
2. Proceed with process spin at [process spin].
3. Process portion size: [portion size].`
  },
  
  // Hydrogenation/Pressurized Reaction
  "H2 reactor preparation": {
    description: `The high-pressure reactor 037-X is prepared for work according to user manual.
1. Stirrer drive 021-XX is installed.
2. Thermosensor 003-XX is connected.
3. Reactor is connected to H2 gas cylinder (red hose).
4. Reactor is connected to argon gas cylinder (blue hose).
5. The vacuum line is connected to membrane pump 001-XX or analogue.
6. Exhaust of outlet line is directed to ventilation.
7. Manometer 023-XX is installed.


The reactor is set up as required: 
Cooling water connected:
Argon is connected: 
Hydrogen is connected: 
Outlet hose end is placed under the fume hood: 
Membrane pump connected: 001-…… 
Connection to tap water is free of leaks: 

`
  },
  // Hydrogenation/Pressurized Reaction
  "H2 reaction": {
    description: `Perform a hydrogenation/pressurized reaction:
1. Set temperature on thermostat 011-XX to [Set temp] with target [Target Temp].
2. Adjust stirring to [Stirring] (range is recommended and can be adjusted).
3. Run the reaction for [Time].
4. Set hydrogen pressure to [H2 pressure].`
  },
  
  // Sieving
  "sieving": {
    description: `Perform a sieving:
1. Use a sieve with size [Sieve size].
2. Process portion size: [portion size].
3. Consider air, moisture, and light sensitivity of the material.`
  },
  
  // Milling
  "milling": {
    description: `Perform a milling:
1. Use a mill of size [mill size].
2. Process portion size: [portion size].
3. Mill for [Time].`
  }
};

export { processInstructions };
