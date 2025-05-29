//operations.js

const processInstructions = {
  // Loading Operations
  "loading-Solid": {
    description: `Load [name] into reactor 002-XX:

1. Weigh [name] on balance 007-XX into jug "[project/TP code]" in ca Xkg portion.
2. Load [name] into reactor via handhole using a plastic scoop and plastic funnel "[project/TP code]".
3. Stirring rate in reactor [Stirring] (recommended).
4. Inert gas flow rate [Inert gas flow rate].
5. Adjust pH to: [pH check]. Measurement is done after 3-5 min from last addition.
6. Set/Adjust temperature on thermostat to [Set temp] (keep jacket/RM temp. difference below 50oC).
7. Keep reaction mixture temperature in range: [Target Temp.].
8. Addition speed - [Addition rate].
9. Loading is performed during: [Time].
10. Keep/Provide temperature of loaded material in range: [Loaded material temp.].
11. Optional: Keep reaction mixture overnight - [break point].

Record parameters into Table X every YY min or more often.

Specified loading: ….. kg (… - … kg)
`
  },
  "loading-liquid <5L": {
    description: `Load [name] into reactor 002-XX: 

1. Weigh [name] using balance 007-XX into jug "[project/TP code]".
2. Pour [name] into reactor via handhole using a plastic funnel "[project/TP code]".
3. Stirring rate in reactor [Stirring] (recommended).
4. Inert gas flow rate [Inert gas flow rate].
5. Adjust pH to: [pH check]. Measurement is done after 3-5 min from last addition.
6. Set/Adjust temperature on thermostat to [Set temp] (keep jacket/RM temp. difference below 50oC).
7. Keep reaction mixture temperature in range: [Target Temp.].
8. Addition speed - [Addition rate].
9. Loading is performed during: [Time].
10. Keep/Provide temperature of loaded material in range: [Loaded material temp.].
11. Optional: Keep reaction mixture overnight - [break point].

Record parameters into Table X every YY min or more often.

Specified loading: ….. kg (… - … kg)
`
  },
  "loading-liquid >5L": {
    description: `Load [name] into reactor 002-XX: 

1. Weigh [name] using balance 007-XX.
2. Connect peristaltic pump and hose "[project/TP code]".
3. Using peristaltic pump, load [name] via handhole. Secure hose to handhole with plastic tie.
4. Set peristaltic pump to [Perist. Pump set].
5. Stirring rate in reactor [Stirring] (recommended).
6. Inert gas flow rate [Inert gas flow rate].
7. Adjust pH to: [pH check]. Measurement is done after 3-5 min from last addition.
8. Set/Adjust temperature on thermostat to [Set temp] (keep jacket/RM temp. difference below 50oC).
9. Keep reaction mixture temperature in range: [Target Temp.].
10. Addition speed - [Addition rate].
11. Loading is performed during: [Time].
12. Keep/Provide temperature of loaded material in range: [Loaded material temp.].
13. Optional: Keep reaction mixture overnight - [break point].

Record parameters into Table X every YY min or more often.

Specified loading: ….. kg (… - … kg)
`
  },
  "loading-dropwise addition": {
    description: `Load [name] into Reactor 002-XX dropping funnel: 

1. Weigh [name] on balance 007-XX into jug "[project/TP code]".
2. Load [name] into the dropping funnel using a plastic funnel "[project/TP code]".
3. Stirring rate in reactor [Stirring] (recommended).
4. Inert gas flow rate [Inert gas flow rate].
5. Adjust pH to: [pH check]. Measurement is done after 3-5 min from last addition.
6. Set/Adjust temperature on thermostat to [Set temp] (keep jacket/RM temp. difference below 50oC).
7. Keep reaction mixture temperature in range: [Target Temp.].
8. Addition speed - [Addition rate].
9. Loading is performed during: [Time].
10. Keep/Provide temperature of loaded material in range: [Loaded material temp.].
11. Optional: Keep reaction mixture overnight - [break point].

Record parameters into Table X every YY min or more often.

Specified loading: ….. kg (… - … kg)
`
  },

  "loading-suspend": {
    description: `Prepare suspension of [name1] in [name2] and load into Reactor 002-XX:

1. Weigh Materials:
  a. Weigh the [name1] using Balance 007-XX.
  b. Weigh the [name2] using Balance 007-XX.
2. Prepare Suspension:
  a. In a suitable container (5L jug), add the [name2].
  b. Slowly add [name1] into the [name2] while stirring to create a suspension.
  c. Ensure that the suspension is well mixed.
  d. Note: [name1] is a dusty product; wear appropriate personal protective equipment (PPE) including masks and protective clothing during handling.
3. Load Suspension into Reactor:
  a. Set/Adjust temperature on thermostat to [Set temp] (keep jacket/RM temp. difference below 50oC).
  b. Keep the temperature of reaction mixture in range: [Target Temp].
  c. Inert gas flow rate [Inert gas flow rate].
  d. Load the suspension into Reactor by carefully pouring through a funnel "[project/TP code]" trying to minimize splashing and exposure.
4. Stirring:
  a. Set the stirring speed to [Stirring] (recommended).
  b. Note: Ensure stirring is adequate to keep the suspension homogeneous.

Record required parameters into table XX every YY min.

Specified loading [name1]: ….. kg (… - … kg)

Specified loading [name2]: ….. kg (… - … kg)



Warehouse code of [name1]:
.........................
(eg. XXXX-XXX)
  
Loading of [name1]: 



Warehouse code of [name2]:
.........................
(eg. XXXX-XXX)
  
Loading of [name2]: 

`
  },
  
  // Reactor Preparation (if needed)
  "reactor prep.": {
    description: `Prepare Reactor 002-XX:

1. Heat Reactor to [Heating to the temp.].
2. Set Argon flow during heating to [Argon flow during heating]
3. Hold Reactor at temperature for [hold time at temp].
4. Cool Reactor to [cooling to temp.].
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
    description: `the analysis according to QDQS:

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
    description: `waste treatment:

1. Process water waste: [water waste].
2. Process organic waste: [organic waste].
3. Process solid waste: [solid waste].`
  },
  
  // Unloading
  "unloading": {
    description: `an unloading:

1. Unload [name] using appropriate method: [method of transf.].
2. Measure unloaded amount: [Amount] kg.
3. Maintain stirring rate during unloading at [Stirring] (recommended).
4. Inert gas flow rate [Inert gas flow rate].
5. Optional: Keep reaction mixture overnight - [break point].`
  },

// decant
"decant": {
  description: `Decant liquid part from reactor 002-XX:

1. Set/Adjust thermostat 011-XX to [Set temp].
2. Keep reaction mixture temperature in range: [Target Temp].
3. Turn off stirrer. Let precipitate settle on the bottom of reactor for [Time].
4. Inert gas flow rate [Inert gas flow rate].
5. Optional: Keep reaction mixture overnight - [break point].
6. After required time passed, pump liquid part (top layer) from reactor into “direction”. Use peristaltic pump and hose "[project/TP code]". Peristaltic pump set: [Perist. Pump set].
7. Stop when [End point].
`
},
  
  // Heating/Cooling
  "heating/cooling": {
    description: `Heating/Cooling with thermostat 011-XX:

1. Check that cooling water for 011-XX is opened.
2. Set/Adjust temperature on 011-XX to [Set temp] (keep jacket/RM temp. difference below 50oC).
3. Adjust reaction mixture temperature to range: [Target Temp].
4. Provide temperature gradient: [cooling/heating grad.].
5. Stirring in reactor 002-XX [Stirring] (recommended). 
6. Inert gas flow rate [Inert gas flow rate].

Record parameters into Table X every YY min or more often.
`
  },
  
  // Hold Time
  "hold time": {
    description: `Hold time:

1. Ensure that temperature on thermostat is set to [Set temp].
2. Hold temperature of reaction mixture in range: [Target Temp] for [Time].
3. Stirring in reactor 002-XX [Stirring] (recommended).
4. Inert gas flow rate [Inert gas flow rate].
5. Optional: Keep reaction mixture overnight - [break point].

Record parameters into Table X every YY min or more often.
`
  },

    "Filter prep.": {
      description: `Filter 046-6-7 (SS filter) setup:

  1. Place a PTFE seal on filtrate receiver top edge.
  2. Connect suspension receiver to filtrate receiver
  3. Install filter cloth into filter and fix it with the plastic ring.
  4. Connect hose "[project/TP code]" to filtrate receiver vacuum valve. Connect other end of hose to a membrane pump.
      
  Membrane pump connected to receiver vacuum valve: 
  Filtration cloth is cut and installed properly: 
  
  Filter 046-2-13 (PP filter) setup:
  1. Connect suspension receiver to glass receiver from reactor 002-XX with norprene hose "[project/TP code]".
  2. Connect reactor receiver to membrane pump with norprene hose "vacuum".
  3. Install filter cloth into filter and fix it with the plastic ring.
      
  Filter is connected to Reactor's receiver vessel: 
  Membrane pump is connected to Reactor's receiver vacuum valve: 
  Filtration cloth is cut and installed properly: 
  
  
  `
    },

  // IPC
  "IPC": {
    description: `In-process control:

In-process control (determination of IP.X conversion after [Sample taken in]):
1. Take approximately XX mL of reaction mixture into a 20 mL vial (using plastic disposable pipette);
2. Sample is quenched: [Sample quenching].
3. Purge the vial with argon;
4. Label the sample with an IPC number.
5. Submit the sample to QC for analysis.
6. Keep stirring the reaction mixture until the IPC result is available.
7. Estimated time for analysis: [Estim. Time of analysis]
Decision criteria based on IPC result (conversion is critical to yield):
• If conversion is [Expected Result], proceed with [IPC Pass action]
• On IPC failure: [IPC Failure Action].




IPC 1:
TBD-0XXX-.... IP.X RM IPC 1
Conversion:
..... %`
  },
  // solution preparation
  "solution prep.": {
    description: `Prepare "description" solution according to table 1.X:

    Solution is prepared: 
`
  },
  // Evaporation from reactor
  "evap.": {
    description: `Evaporation from reactor 002-XX:

1. Set/Adjust temperature thermostat 011-XX to [Set temp] with target [Target Temp] (keep jacket/RM temp. difference below 50oC).
2. Connect membrane pump via cold trap and turn it ON.
3. Gradually reduce pressure [Pressure set range]. 
   NB! Make sure the condenser is not overflooded with condensed solvent, adjust pressure accordingly.
4. Maintain stirring at [Stirring] (recommended).
5. Continue until end point: [End point].
6. Inert gas flow rate [Inert gas flow rate].
7. Optional: Keep reaction mixture overnight - [break point].

Record parameters into Table X every YY min or more often.
`
  },

    // Evaporation from reactor
    "evap. Rota": {
      description: `Start evaporation in rotary evaporator 009-XX:

1. Check 009-XX bath level. Add more RO water if needed.
2. Connect and tighten flask "[project/TP code]" using a special key.
3. Set/Adjust bath temperature to [Set temp].
4. Turn ON condenser cooling water.
5. Connect membrane pump via a cold trap and turn it ON.
6. Connect hose "[project/TP code]" for loading solution, open loading valve and load solution for evaporation.
7. Gradually reduce the pressure within the range [Pressure set range]. 
   NB! Make sure the condenser is not overflooded with condensed solvent, adjust pressure accordingly.
8. Set/Adjust stirring to [Stirring] (recommended).
9. Continue until: [End point].
10. Inert gas flow rate [Inert gas flow rate].
11. Optional: Keep reaction mixture overnight - [break point].

Record parameters into Table X every YY min or more often.
`
    },
  
  // Extraction/Separation
  "extr./separ.": {
    description: `Extraction/separation:

1. Stop stirring and let phases completely separate (visual check). Separation time: NLT [Exp. time].

At the end layers clearly separated: Yes  / No 
(in case of No, inform PM)

next op.______________

2. Perform phase separation. 
 - Bottom "description" phase is stored into container "[project/TP code]".
 - Top "description" phase  is stored into container "[project/TP code]".

m org phase: ……….. kg;

m water phase: …….. kg;

next op.______________

3. Return "description" phase into reactor.

next op.______________

`
  },
  
  // Filtration
  "filtration": {
    description: `Filter the material:

1. Keep stirring in Reactor 002-XX to 150-60rpm (gradually decreasing).
2. Connect norprene hose "[project/TP code]" from reactor valve and through peristaltic pump to Nutsch filter. Set the peristaltic pump to 40-60%.
3. Set the membrane pump to [Pressure set] and start it.
4. Start peristaltic pump, open reactor’s valve and transfer the reaction mixture from the Reactor to the Nutsch filter in portions, allowing filtration to proceed.
5. Record actula achieved pressure during filtration: [actual pressure].
6. Continue until [End point]. 
7. Use a spoon "[project/TP code]" to press and remove cracks that might appear on filter cake.

NB! Once Reactor’s receiver is 2/3 full, stop the process, release the vacuum from the system, connect filter outlet to atmosphere and empty filtrate into container "[project/TP code]". Resume the process afterwards.`
  },

  "Candle Filter prep.": {
    description: `Candle filter preparation:

1. Assemble the filter using the [filter size] cartridge and filter case.
2. Secure the case with the special key.
3. Connect Norprene hoses "[project/TP code]": attach the inlet to the larger pore side and the outlet to the smaller pore side.`
  },
  // Filtration with Candle Filter
  "filtration with candle filter": {
    description: `Filter the reaction mass using candle filter:

1. Set flow rate to [Flow rate].
2. Continue until reaching end point: [End point].`
  },
  
  // Washing FK
  "Washing Filter cake": {
    description: `Wash filter cake with [name]:

1. Stop membrane pump. Connect outlet to the atmosphere (to prevent filter cloth from pushing by air from below).
2. Weight [name] for washing Filter cake using balance 007-XX. Then pour onto filter cake.
3. Ensure loaded material temperature is [Loaded material temp.].
4. Mix on filter manually: [Mixing on filter].

Specified loading: ….. kg (… - … kg)`
  },
  
  // Dry on Filter
  "Dry on filter": {
    description: `Dry filter cake on filter under vacuum:

1. Once Filter cake is visually dry, maintain it on the filter.
2. Continue to apply vacuum [Pressure set] for [Time] to remove residual solvents.
3. Use a spoon "[project/TP code]" to press and remove cracks that might appear on filter cake.
4. "Comment: Consider air, moisture, and light sensitivity of the material."

next op.______________

5. After finishing drying on filter, pump the filtrate from the filter into waste container and weigh it.

m tara = ....... kg\n;
m gross weight = ....... kg\n;
m net "type of waste" waste = ....... kg\n; `
  },
  
  // Drying in Vacuum
  "drying in vac.": {
    description: `a) Weighing of empty trays for drying:

1. Weigh each tray.
Record tare mass in Table X.

Table X. filled: 

next op.______________
b) Filling the trays

1. Transfer the wet product (Filter cake) onto trays: spread uniform layer thickness on the trays,
the product should not stick out above tray edges.
2. Distribute the wet product approximately evenly among XX trays.
3. Crush any large lumps with a shovel or suitable utensil.
4. Weigh each tray with product.

Record loaded mass in Table X.

next op.______________
c) Preparation of Vacuum Oven 012-XX:

1. Arrange trays inside the oven, ensuring proper spacing/airflow.
2. Attach membrane pump to the oven via cold trap filled with dry ice.
3. Overheating protection (safety limit): [overheating prot.].
4. Working temperature set point: [Set temp].
5. Initial vacuum set point: [Pressure set range].

NB! Do not forget to put logger on one of the middle shelves.


Temperature logger is placed in oven 

next op.______________
d) Drying and Interim weighings:

1. Begin drying under set conditions ([Set temp], [Pressure set range]). 
2. After NLT 12 hours of drying, perform mixing/delumping to break up any lumps. 
3. Dry the product for a total of [Time].
4. Interim weighings:
After NLT 24 h, start checking product weight periodically to determine drying progress.
Fill Table X.

5. End of drying:
In 2–3 hours total weight loss AND weight loss of each tray should be NMT3%. 
If within acceptance range – drying is over. 
(Proceed with the next operation.)


Table X filled: 

Pressure after at least 1h from the start: ...... Torr

Temperature after at least 1h from the start: .......°C`
  },
  
  // Drying at Atmospheric Pressure
  "drying at atm.": {
    description: `Weighing of empty trays for drying:

1. Weigh each tray.
Record tare mass in Table X.

Table X. filled: 

next op.______________
b) Filling the trays

1. Transfer the wet product (Filter cake) onto trays: spread uniform layer thickness on the trays,
the product should not stick out above tray edges.
2. Distribute the wet product approximately evenly among XX trays.
3. Crush any large lumps with a shovel or suitable utensil.
4. Weigh each tray with product.

Record loaded mass in Table X.

next op.______________
c) Preparation of Vacuum Oven 012-XX:

1. Arrange trays inside the oven, ensuring proper spacing/airflow.
2. Overheating protection (safety limit): [overheating prot.].
3. Working temperature set point: [Set temp].
4. Set fan to: [fan set.].
5. Set flap to [flap set.].

NB! Do not forget to put logger on one of the middle shelves.


Temperature logger is placed in oven 

next op.______________
d) Drying and Interim weighings:

1. Begin drying under set conditions - [Set temp]. 
2. After NLT 12 hours of drying, perform mixing/delumping to break up any lumps. 
3. Dry the product for a total of [Time].
4. Interim weighings:
After NLT 24 h, start checking product weight periodically to determine drying progress.
Fill Table X.

5. End of drying:
In 2–3 hours total weight loss AND weight loss of each tray should be NMT3%. 
If within acceptance range – drying is over. 
(Proceed with the next operation.)


Table X filled: 

Overheating set: .......°C

Fan set: .......%;

Flap set: .......%;

Temperature after at least 1h from the start: .......°C`
  },

    // Drying at Atmospheric Pressure
    "end of drying in oven": {
      description: `Finish drying:

  1. Save thermostat 011-XX temperature logs on the USB stick that is inside the control panel or in the USB ports.
  2. Turn off membrane pump and repressurize the oven. Turn off the oven.
  3. Remove the trays from the oven and weigh them. Calculate loss on drying and fill Table X.
  4. Calculate process yield:
`
    },
  
  // Centrifuging
  "centrifuging": {
    description: `a centrifuging:

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
5. The vacuum line is connected to membrane pump or analogue.
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
    description: `a hydrogenation/pressurized reaction:

1. Set temperature on thermostat to [Set temp].
2. Target temperature in reaction mixture should be in range [Target Temp].
3. Adjust stirring to [Stirring] (recommended).
4. Run the reaction for [Time].
5. Set hydrogen pressure to [H2 pressure].`
  },
  
  // Sieving
  "sieving": {
    description: `a sieving:

1. Use a sieve with size [Sieve size].
2. Process portion size: [portion size].
3. Consider air, moisture, and light sensitivity of the material.`
  },
  
  // Milling
  "milling": {
    description: `a milling:

1. Use a mill of size [mill size].
2. Process portion size: [portion size].
3. Mill for [Time].`
  }
};

export { processInstructions };
