const mongo = require("mongodb");

async function go() {
    const connection = await mongo.MongoClient.connect("mongodb://localhost:27017/shardKeyTest");
    const collection = connection.collection("seq-guid-test");

    await collection.deleteMany({});

    await collection.insertMany([
        createFor(1, "F6A77D40-3B93-E711-9210-415645000030"),
        createFor(2, "F7A77D40-3B93-E711-9210-415645000030"),
        createFor(3, "7D611648-3B93-E711-9210-415645000030"),
        createFor(4, "9FBE5656-3B93-E711-9210-415645000030"),
        createFor(5, "83165E5C-3B93-E711-9210-415645000030"),
    ]);

    const project = { no: 1, _id: 0 };
    const naturalSort = await collection.find({}, project).toArray();
    const orderedByString = await collection.find({}, project, { sort: { string: 1 } }).toArray();
    const orderedByBinary = await collection.find({}, project, { sort: { binary: 1 } }).toArray();

    console.log("Natural sort:");
    console.log(naturalSort);

    console.log();
    console.log();

    console.log("String sort:");
    console.log(orderedByString);

    console.log();
    console.log();

    console.log("Binary sort:");
    console.log(orderedByBinary);
}

function createFor(no, guid) {
    return { no: no, string: guid, binary: parse(guid) };
}

// Taken from https://github.com/srcagency/mongo-uuid
function parse(string ) {
    function normalize( string ){
        if (typeof string !== 'string')
            return false
    
        const stripped = string.replace(/-/g, '')
    
        if (stripped.length !== 32 || !stripped.match(/^[a-fA-F0-9]+$/))
            return false
    
        return stripped
    }

    const normalized = normalize(string)

    if (normalized === false)
        throw new ParseError('Invalid hex string')

    return new mongo.Binary(
        Buffer.from(normalized, 'hex'),
        mongo.Binary.SUBTYPE_UUID
    )
}

go()
    .then(() => { console.log("Finished"); process.exit(0); })
    .catch(e => { console.error("ERROR: ", e); process.exit(1); });