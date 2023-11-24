import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { generateNonce } from '@mysten/zklogin';

const keypair = new Ed25519Keypair();
// console.log('keypair', keypair);
const pk = keypair.getPublicKey().toSuiAddress();
const sk = keypair.export().privateKey;
// console.log('pk', pk);
// console.log('sk', sk);

// const ser = JSON.stringify(keypair);
// console.log('ser', ser);

// const des = JSON.parse(ser);
// console.log('des.keypair', des.keypair);
// des.keypair.publicKey = new Uint8Array(Object.values(des.keypair.publicKey));
// des.keypair.secretKey = new Uint8Array(Object.values(des.keypair.secretKey));
// // des.keypair.privateKey = new Uint8Array(Object.values(des.keypair.privateKey));

// console.log('des', des);

// // const r2 = new Ed25519Keypair.(des.keypair);

// const restored = new Ed25519Keypair(des.keypair);
// const pkr = restored.getPublicKey().toSuiAddress();
// const skr = restored.export().privateKey;
// console.log('pkr', pkr);
// console.log('skr', skr);

// console.log('pk === pkr', pk === pkr);
// console.log('sk === skr', sk === skr);

const serializeKeypair = (keypair: Ed25519Keypair) => {
  const ser = JSON.stringify(keypair);
  return ser;
};

const deserializeKeypair = (ser: string) => {
  const des = JSON.parse(ser);
  des.keypair.publicKey = new Uint8Array(Object.values(des.keypair.publicKey));
  des.keypair.secretKey = new Uint8Array(Object.values(des.keypair.secretKey));
  return new Ed25519Keypair(des.keypair);
};

// const ser = serializeKeypair(keypair);
// console.log('ser', ser);

// const des = deserializeKeypair(ser);
// console.log('des', des);

// const pkr = des.getPublicKey().toSuiAddress();
// const skr = des.export().privateKey;

// console.log('pkr', pkr);
// console.log('skr', skr);

// const pk2 = des.getPublicKey().toSuiAddress();
// const sk2 = des.export().privateKey;
// console.log('pk2', pk2);
// console.log('sk2', sk2);

// console.log('pk === pk2', pk === pk2);
// console.log('sk === sk2', sk === sk2);

// const a =
//   '{"keypair":{"publicKey":{"0":229,"1":153,"2":42,"3":54,"4":232,"5":150,"6":16,"7":122,"8":132,"9":196,"10":31,"11":247,"12":46,"13":138,"14":205,"15":164,"16":53,"17":45,"18":195,"19":81,"20":110,"21":75,"22":60,"23":89,"24":121,"25":93,"26":83,"27":202,"28":187,"29":50,"30":173,"31":90},"secretKey":{"0":47,"1":102,"2":87,"3":90,"4":152,"5":208,"6":120,"7":172,"8":119,"9":230,"10":18,"11":3,"12":138,"13":145,"14":171,"15":253,"16":217,"17":14,"18":196,"19":174,"20":11,"21":213,"22":226,"23":182,"24":185,"25":200,"26":8,"27":85,"28":210,"29":191,"30":132,"31":48,"32":229,"33":153,"34":42,"35":54,"36":232,"37":150,"38":16,"39":122,"40":132,"41":196,"42":31,"43":247,"44":46,"45":138,"46":205,"47":164,"48":53,"49":45,"50":195,"51":81,"52":110,"53":75,"54":60,"55":89,"56":121,"57":93,"58":83,"59":202,"60":187,"61":50,"62":173,"63":90}}}';
// const kp3 = deserializeKeypair(a);
// console.log('p3', kp3.getPublicKey().toSuiAddress());
// console.log('s3', kp3.export().privateKey);

const j = {
  provider: 'Google',
  maxEpoch: 1000,
  jwtRandomness: '163996547504429094438395854558103973707',
  ephemeralSecretKeyStr: 'B6jVIB99eQ4nkYkZ0V6Em3EgDLNh9jDtH7CalSfJFT0=',
  ephemeralPublicKeyStr: '0x8ca94b9aad2a24ae8c6addd47b7837c3bf08ced60604076ab250069027a5d16f',
  ephemeralKeypairStr:
    '{"keypair":{"publicKey":{"0":36,"1":226,"2":59,"3":207,"4":226,"5":87,"6":210,"7":50,"8":211,"9":98,"10":0,"11":54,"12":164,"13":237,"14":188,"15":107,"16":2,"17":10,"18":1,"19":233,"20":64,"21":235,"22":44,"23":95,"24":174,"25":37,"26":100,"27":170,"28":161,"29":99,"30":84,"31":212},"secretKey":{"0":7,"1":168,"2":213,"3":32,"4":31,"5":125,"6":121,"7":14,"8":39,"9":145,"10":137,"11":25,"12":209,"13":94,"14":132,"15":155,"16":113,"17":32,"18":12,"19":179,"20":97,"21":246,"22":48,"23":237,"24":31,"25":176,"26":154,"27":149,"28":39,"29":201,"30":21,"31":61,"32":36,"33":226,"34":59,"35":207,"36":226,"37":87,"38":210,"39":50,"40":211,"41":98,"42":0,"43":54,"44":164,"45":237,"46":188,"47":107,"48":2,"49":10,"50":1,"51":233,"52":64,"53":235,"54":44,"55":95,"56":174,"57":37,"58":100,"59":170,"60":161,"61":99,"62":84,"63":212}}}',
  nonce: 'Tn4-3NloD5pHjuQvRSB9FmUpmbY',
  salt: '',
  zkLoginAddress: '0x9a25593eaf45633e878b58f534903022e40d2797e8cb03f77113c2ed33956083',
  zkProof: null,
  ephemeralKeyPair: {
    keypair: {
      publicKey: {
        '0': 36,
        '1': 226,
        '2': 59,
        '3': 207,
        '4': 226,
        '5': 87,
        '6': 210,
        '7': 50,
        '8': 211,
        '9': 98,
        '10': 0,
        '11': 54,
        '12': 164,
        '13': 237,
        '14': 188,
        '15': 107,
        '16': 2,
        '17': 10,
        '18': 1,
        '19': 233,
        '20': 64,
        '21': 235,
        '22': 44,
        '23': 95,
        '24': 174,
        '25': 37,
        '26': 100,
        '27': 170,
        '28': 161,
        '29': 99,
        '30': 84,
        '31': 212,
      },
      secretKey: {
        '0': 7,
        '1': 168,
        '2': 213,
        '3': 32,
        '4': 31,
        '5': 125,
        '6': 121,
        '7': 14,
        '8': 39,
        '9': 145,
        '10': 137,
        '11': 25,
        '12': 209,
        '13': 94,
        '14': 132,
        '15': 155,
        '16': 113,
        '17': 32,
        '18': 12,
        '19': 179,
        '20': 97,
        '21': 246,
        '22': 48,
        '23': 237,
        '24': 31,
        '25': 176,
        '26': 154,
        '27': 149,
        '28': 39,
        '29': 201,
        '30': 21,
        '31': 61,
        '32': 36,
        '33': 226,
        '34': 59,
        '35': 207,
        '36': 226,
        '37': 87,
        '38': 210,
        '39': 50,
        '40': 211,
        '41': 98,
        '42': 0,
        '43': 54,
        '44': 164,
        '45': 237,
        '46': 188,
        '47': 107,
        '48': 2,
        '49': 10,
        '50': 1,
        '51': 233,
        '52': 64,
        '53': 235,
        '54': 44,
        '55': 95,
        '56': 174,
        '57': 37,
        '58': 100,
        '59': 170,
        '60': 161,
        '61': 99,
        '62': 84,
        '63': 212,
      },
    },
  },
  extendedEphemeralPublicKey: 'ACTiO8/iV9Iy02IANqTtvGsCCgHpQOssX64lZKqhY1TU',
};

// const d = JSON.parse(j);
const d = j;
const kp4 = deserializeKeypair(d.ephemeralKeypairStr);
const p4 = kp4.getPublicKey();
const nonce = generateNonce(p4 as never, d.maxEpoch, d.jwtRandomness);
console.log('nonce', nonce);
