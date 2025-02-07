const operations ={
    opNumber: 1,
    activityName: "loading", 
    activityType: "input->process",//this can be input->process; process; process->output;
    description: "Load iso-propyl acetate",
    reagentName: "Isopropyl acetate", //can be either TEXT or null
    parameterValue: {
      "Amount": 24.54,
      "SetTemp": "start cooling",  //list here all parameters and their value
      "Temp. of rm": "15-25oC",
      "Stirring": "tbd",
      "Addition rate": "in one portion"
    },
    expectedVolume: null, // this can be number or null
    equipment: "Reactor"
}

