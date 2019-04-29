async function main() {
    // Imports the Google Cloud client library
    const language = require('@google-cloud/language');

    // Creates a client
    const client = new language.LanguageServiceClient();

    /**
     * TODO(developer): Uncomment the following line to run this code.
     */
    const text = 'Google, headquartered in Mountain View (1600 Amphitheatre Pkwy, Mountain View, CA 940430), unveiled the new Android phone for $799 at the Consumer Electronic Show. Sundar Pichai said in his keynote that users love their new Android phones.';

    // Prepares a document, representing the provided text
    const document = {
    content: text,
    type: 'PLAIN_TEXT',
    };
    var total_results;
    // 1. Detects entities in the document
    var [result] = await client.analyzeEntities({document});
    console.log(result);
    //console.log(typeof result);
    //const entities = result.entities;
    //console.log(entities);
    
    //console.log('Entities:');
    //entities.forEach(entity => {
    //console.log(entity.name);
    //console.log(` - Type: ${entity.type}, Salience: ${entity.salience}`);
    //if (entity.metadata && entity.metadata.wikipedia_url) {
    //    console.log(` - Wikipedia URL: ${entity.metadata.wikipedia_url}$`);
    //}
    //});

    // 2. Classifies text in the document
    var [result2] = await client.classifyText({document: document});
    console.log(result2);

    // 3. sentiment analysis 
    // Detects the sentiment of the document
    var [result3] = await client.analyzeSentiment({document: document});
    console.log(result3);
    //
}
  
main().catch(console.error);