const fs = require("fs");
const readline = require("readline");
const mongo = require("mongodb");

module.exports = function(collection) {
    return new Promise((resolve, reject) => {
        const rd = readline.createInterface({
            input: fs.createReadStream("./sequentialGuids.rpt"),
        });

        let pendingInserts = 0;
        let actuallyInserted = 0;
        let finishedReading = false;

        rd.on("line", function(line) {
            const parts = line.split(" ").map(part => part.trim()).filter(part => !!part);
            const no = parseInt(parts[0]);
            const guid = parts[1];
            
            if (isNaN(no))
            {
                // May header/footer
                return;
            }

            pendingInserts++;
            collection.insertOne(
                {
                    no: no,
                    string: guid,
                    binary: parse(guid),
                },
                () => {
                    pendingInserts--;
                    actuallyInserted++;
                    checkWhetherFinished();
                 }
            );
        });

        rd.on("close", () => {
            finishedReading = true;
            checkWhetherFinished();
        })

        function checkWhetherFinished() {
            if (finishedReading && pendingInserts === 0) {
                console.log(`Inserted ${actuallyInserted}`);
                resolve();
            }
        }
    });
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
        throw new Error('Invalid hex string')

    return new mongo.Binary(
        Buffer.from(normalized, 'hex'),
        mongo.Binary.SUBTYPE_UUID
    )
}