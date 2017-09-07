const mongo = require("mongodb");
const insertGuids = require("./insertGuids");

async function go() {
    const connection = await mongo.MongoClient.connect("mongodb://localhost:27017/shardKeyTest");
    const collection = connection.collection("seq-guid-test");

    await collection.deleteMany({});

    await insertGuids(collection);

    const project = { no: 1, _id: 0 };
    const naturalSort = await collection.find({}, project).toArray();
    const orderedByString = await collection.find({}, project, { sort: { string: 1 } }).toArray();
    const orderedByBinary = await collection.find({}, project, { sort: { binary: 1 } }).toArray();

    console.log();
    console.log();

    console.log("Natural sort:");
    console.log(getResult(naturalSort));

    console.log();
    console.log();

    console.log("String sort:");
    console.log(getResult(orderedByString));

    console.log();
    console.log();

    console.log("Binary sort:");
    console.log(getResult(orderedByBinary));

    console.log();
    console.log();
}

function createFor(no, guid) {
    return { no: no, string: guid, binary: parse(guid) };
}

function getResult(items) {
    const start = items
        .map(item => item.no)
        .filter((_, index) => index < 10);
    const finish = items
        .map(item => item.no)
        .filter((_, index) => index > items.length - 4);

    return start.concat(["..."]).concat(finish);
}



go()
    .then(() => { console.log("Finished"); process.exit(0); })
    .catch(e => { console.error("ERROR: ", e); process.exit(1); });