/** Plantilla fija del servicio Monorriel (puestos + personal base AM/PM + nómina) */
window.RFS_MONORRIEL = {
  posts: [
    { id: "m01", no: 1, location: "Estación 01", position: "Ascensor" },
    { id: "m02", no: 2, location: "Estación 01", position: "Escalera" },
    { id: "m03", no: 3, location: "Estación 02", position: "Ascensor" },
    { id: "m04", no: 4, location: "Estación 02", position: "Escalera" },
    { id: "m05", no: 5, location: "Estación 03", position: "Ascensor" },
    { id: "m06", no: 6, location: "Estación 03", position: "Escalera" },
    { id: "m07", no: 7, location: "Estación 03 / Área", position: "Contenedores / Ponche" },
    { id: "m08", no: 8, location: "Estación 04", position: "Ascensor" },
    { id: "m09", no: 9, location: "Estación 04", position: "Escalera" },
    { id: "m10", no: 10, location: "Estación 05", position: "Escalera" },
    { id: "m11", no: 11, location: "Estación 05", position: "Ascensor" },
    { id: "m12", no: 12, location: "Estación 06", position: "General" },
    { id: "m13", no: 13, location: "Estación 07", position: "Ascensor" },
    { id: "m14", no: 14, location: "Estación 07", position: "Escalera" },
    { id: "m15", no: 15, location: "Transuix 201", position: "Área Transuix" },
    { id: "m16", no: 16, location: "Transuix 209", position: "Área Transuix" },
    { id: "m17", no: 17, location: "Transuix 08", position: "Área Transuix" },
    { id: "m18", no: 18, location: "El Hoyo", position: "Sector El Hoyo" },
    { id: "m19", no: 19, location: "Entrada Don Jaime", position: "Acceso / Entrada" },
    { id: "m20", no: 20, location: "Patio Taller Comedor", position: "Patio Taller / Comedor" },
    { id: "m21", no: 21, location: "Para Rayo 01", position: "Protección / Para Rayos" },
    { id: "m22", no: 22, location: "Para Rayo 02", position: "Protección / Para Rayos" },
    { id: "m23", no: 23, location: "Lote 08", position: "Área Lote" },
    { id: "m24", no: 24, location: "Ruta Motorizada", position: "Motorizada 01" },
    { id: "m25", no: 25, location: "Ruta Motorizada", position: "Motorizada 02" },
    { id: "m26", no: 26, location: "Ruta Motorizada", position: "Motorizada 03" },
    { id: "m27", no: 27, location: "Estación 12", position: "Escalera" },
    { id: "m28", no: 28, location: "Estación 12", position: "Ascensor" },
  ],
  /**
   * Nómina Monorriel (Excel NOMINA_MONO · 16-30 sep 2026).
   * Mismos parámetros que La Vega Autopista: Unif/Rifa, Almuerzo/SVDA (comida+90), nombre corto.
   */
  payrollRoster: [
    {
      "name": "ALEXIS BIENVENIDO PERALTA",
      "position": "COMEDOR",
      "salaryMonthly": 24000
    },
    {
      "name": "FRANCISCO ANT CERDA",
      "position": "ESTACION 4",
      "salaryMonthly": 24000
    },
    {
      "name": "JESUS MARIA MATA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "JOSE LUIS AQUINO",
      "position": "LOTE 8",
      "salaryMonthly": 24000
    },
    {
      "name": "JUAN BAEZ",
      "position": "ESTACION 3",
      "salaryMonthly": 24000
    },
    {
      "name": "JOSE TINEO",
      "position": "ESTACION 7",
      "salaryMonthly": 24000
    },
    {
      "name": "RAFAEL CRUZ CRUZ",
      "position": "ESTACION 1",
      "salaryMonthly": 24000
    },
    {
      "name": "RAFAEL RODRIGUEZ",
      "position": "Monorriel",
      "salaryMonthly": 38000
    },
    {
      "name": "SEVERO GARCIA",
      "position": "MOTO",
      "salaryMonthly": 24000
    },
    {
      "name": "ONELIO QUEZADA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "WILLY ESTEVEZ",
      "position": "MOTO",
      "salaryMonthly": 24000
    },
    {
      "name": "ANTONIO ROSIS",
      "position": "POR FUERA",
      "salaryMonthly": 24000
    },
    {
      "name": "ALEXI MERCADO",
      "position": "ESTACION 12",
      "salaryMonthly": 24000
    },
    {
      "name": "ALCELMO REYES",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "CARLOS PERALTA JERES",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "FERNANDO PIERRE",
      "position": "ESTACION 4",
      "salaryMonthly": 24000
    },
    {
      "name": "FRANCISCO LUCIANO CONTRERAS",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "FRANCISCO MARTINEZ",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "FRANCISCO MERAN",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "HENYORY POLANCO",
      "position": "ESTACION 2",
      "salaryMonthly": 24000
    },
    {
      "name": "HILARIO ENRRIQUEZ",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "JEUDY RODRIGUEZ",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "JOSE MANUEL MINAYA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "JOSE RAMON ANT RODRIGUEZ",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "JUAN CARLOS CONTRERAS",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "JUAN CARLOS TAVARES",
      "position": "ESTACION 12",
      "salaryMonthly": 24000
    },
    {
      "name": "JUAN CARLOS GONZALEZ",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "LINO RAMON PAULINO",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "LUCIO CONTRERA ALCANTARA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "MARIO JOSE GONZALEZ",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "MANUEL LORENZO",
      "position": "CUBRIDOR",
      "salaryMonthly": 24000
    },
    {
      "name": "RAMON UREÑA",
      "position": "CUBRIDOR",
      "salaryMonthly": 24000
    },
    {
      "name": "ROMAN ROSARIO",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "RAMON NUÑEZ",
      "position": "CUBRIDOR",
      "salaryMonthly": 24000
    },
    {
      "name": "ROBERT SUERO",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "SANDY ZAPATA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "WILIAM RODRIGUEZ",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "ONELKI DELGADO",
      "position": "CUBRIDOR",
      "salaryMonthly": 24000
    },
    {
      "name": "YNOCENCIO CONTRERA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "WILLY MERCADO",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "ARIEL AQUILES DOMINGUEZ",
      "position": "CUBRIDOR",
      "salaryMonthly": 24000
    },
    {
      "name": "AQUILES GARCIA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "BENITO RAMIREZ",
      "position": "ESTACION 5",
      "salaryMonthly": 24000
    },
    {
      "name": "CARLOS MANUEL TORIBIO",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "DANIEL PEREZ DIAZ",
      "position": "RAYO 2",
      "salaryMonthly": 24000
    },
    {
      "name": "ENMANUEL MARTINEZ",
      "position": "CUBRIDOR",
      "salaryMonthly": 24000
    },
    {
      "name": "FAUSTO MARTINEZ",
      "position": "ESTACION 6",
      "salaryMonthly": 24000
    },
    {
      "name": "FELIZ MARIA ESTEVEZ",
      "position": "ESTACION 3",
      "salaryMonthly": 24000
    },
    {
      "name": "FRANCISCO PEÑA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "FERNANDO CONTRERAS",
      "position": "ESTACION 3",
      "salaryMonthly": 24000
    },
    {
      "name": "FERNANDO SANTOS",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "FELLO GARCIA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "GILBERTO GARCIA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "HECTOR LOPEZ",
      "position": "LOTE 8",
      "salaryMonthly": 24000
    },
    {
      "name": "HECTOR FELIX",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "JUNIOR DE JESUS TAVAREZ",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "JORGE TEJADA",
      "position": "MOTO",
      "salaryMonthly": 24000
    },
    {
      "name": "JOSE ANTONIO BELTRE",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "JIMMI DE AZA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "LEONARDO VASQUEZ",
      "position": "ESTACION 12",
      "salaryMonthly": 24000
    },
    {
      "name": "LINO ANT FERNANDEZ",
      "position": "ESTACION 4",
      "salaryMonthly": 24000
    },
    {
      "name": "MARIO PEÑA",
      "position": "PONCHE",
      "salaryMonthly": 24000
    },
    {
      "name": "MARINO PEÑA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "MANUEL PEÑA",
      "position": "CUBRIDOR",
      "salaryMonthly": 24000
    },
    {
      "name": "ROBERTO FERREIRA",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "ROBERTICO DIAZ",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "SANTO SANTOS AYBAR",
      "position": "ESTACION 1",
      "salaryMonthly": 24000
    },
    {
      "name": "SANTO RAFAEL SANTOS",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "VICTOR CONTRERAS",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "WARLYN CASTILLO",
      "position": "Monorriel",
      "salaryMonthly": 24000
    },
    {
      "name": "YORDY REYES",
      "position": "CUBRIDOR",
      "salaryMonthly": 24000
    }
  ],
  /** Personal base (importa a Empleados como "(Monorriel)") — lista unificada desde Excel nómina */
  staffAm: [
    "ALEXIS BIENVENIDO PERALTA",
    "FRANCISCO ANT CERDA",
    "JESUS MARIA MATA",
    "JOSE LUIS AQUINO",
    "JUAN BAEZ",
    "JOSE TINEO",
    "RAFAEL CRUZ CRUZ",
    "RAFAEL RODRIGUEZ",
    "SEVERO GARCIA",
    "ONELIO QUEZADA",
    "WILLY ESTEVEZ",
    "ANTONIO ROSIS",
    "ALEXI MERCADO",
    "ALCELMO REYES",
    "CARLOS PERALTA JERES",
    "FERNANDO PIERRE",
    "FRANCISCO LUCIANO CONTRERAS",
    "FRANCISCO MARTINEZ",
    "FRANCISCO MERAN",
    "HENYORY POLANCO",
    "HILARIO ENRRIQUEZ",
    "JEUDY RODRIGUEZ",
    "JOSE MANUEL MINAYA",
    "JOSE RAMON ANT RODRIGUEZ",
    "JUAN CARLOS CONTRERAS",
    "JUAN CARLOS TAVARES",
    "JUAN CARLOS GONZALEZ",
    "LINO RAMON PAULINO",
    "LUCIO CONTRERA ALCANTARA",
    "MARIO JOSE GONZALEZ",
    "MANUEL LORENZO",
    "RAMON UREÑA",
    "ROMAN ROSARIO",
    "RAMON NUÑEZ",
    "ROBERT SUERO",
    "SANDY ZAPATA",
    "WILIAM RODRIGUEZ",
    "ONELKI DELGADO",
    "YNOCENCIO CONTRERA",
    "WILLY MERCADO",
    "ARIEL AQUILES DOMINGUEZ",
    "AQUILES GARCIA",
    "BENITO RAMIREZ",
    "CARLOS MANUEL TORIBIO",
    "DANIEL PEREZ DIAZ",
    "ENMANUEL MARTINEZ",
    "FAUSTO MARTINEZ",
    "FELIZ MARIA ESTEVEZ",
    "FRANCISCO PEÑA",
    "FERNANDO CONTRERAS",
    "FERNANDO SANTOS",
    "FELLO GARCIA",
    "GILBERTO GARCIA",
    "HECTOR LOPEZ",
    "HECTOR FELIX",
    "JUNIOR DE JESUS TAVAREZ",
    "JORGE TEJADA",
    "JOSE ANTONIO BELTRE",
    "JIMMI DE AZA",
    "LEONARDO VASQUEZ",
    "LINO ANT FERNANDEZ",
    "MARIO PEÑA",
    "MARINO PEÑA",
    "MANUEL PEÑA",
    "ROBERTO FERREIRA",
    "ROBERTICO DIAZ",
    "SANTO SANTOS AYBAR",
    "SANTO RAFAEL SANTOS",
    "VICTOR CONTRERAS",
    "WARLYN CASTILLO",
    "YORDY REYES"
  ],
  /** Compat: lista PM vacía; el roster unificado está en staffAm / payrollRoster */
  staffPm: [],
};
