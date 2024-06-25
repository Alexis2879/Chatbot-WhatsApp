const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot')
require('dotenv').config

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const MockAdapter = require('@bot-whatsapp/database/mock')   /*comentar esta párte*/
/*const { delay } = require('@whiskeysockets/baileys')*/
const path = require('path')
const fs = require('fs')
const chat = require('./chatGPT')


/*hacemos el llamado de la carpeta  mensajes*/
const menuPath = path.join(__dirname, 'mensajes', 'menu.txt')
const menu = fs.readFileSync(menuPath, 'utf8')


/*const flowVoice = addKeyword(EVENTS.VOICE_NOTE).addAnswer("Esta es una nota de voz", null, async (ctx, ctxFn) => {
const text = await handlerAI(ctx)
const prompt = promptConsultas
const consulta = text
const answer = await chat(prompt, consulta)
await ctxFn.flowDynamic(answer.content)
})  DESCOMENTAR   */


/*mensaje de Bienvenida*/

/*Menu del chat bor*/
const flowMenuYoki = addKeyword(EVENTS.ACTION)
    .addAnswer('🙌 este es el Menú', {
        media:"https://sydney.pe/c/ropa-de-bebe/"
})
    


/*Consultas del Chat bot*/
const flowConsultas = addKeyword(EVENTS.ACTION)
    .addAnswer('🙌 Consultame' )
    .addAnswer('Haz tu Consulta', { capture: true }, async (ctx,ctxFn) => {
        const prompt = 'Responde Hola' /*promptConsulta*/
        const consulta = ctx.body
        const answer = await chat(prompt, consulta)
        console.log(answer.content)
        /*await ctxFn.flowDynamic(answer.content)*/
    })
    

const flowComprar = addKeyword(EVENTS.ACTION)
    .addAnswer('🙌 Comprar: https://sydney.pe/c/ropa-de-bebe/' )
    

const flowWelcome = addKeyword(EVENTS.WELCOME)
    .addAnswer("Este es el flujo Welcome", {
        delay: 2000,
        /*media: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRtKQZd33bGyviMoji-g8X4lzQk9oJP5kIkhA&s"*/
    },
        async (ctx, ctxFn) => {
            if (ctx.body.includes('casas')) {
                await ctxFn.flowDynamic('Escirbiste casas')
            } else {
                await ctxFn.flowDynamic('Escribiste otra cosa')
            }
    })


    /*Menu del Chatbot*/
const menuFlow = addKeyword('Menu').addAnswer(
    menu,
    { capture: true },
    async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
        if (!['1', '2', '3',/* '4', '5',*/ '0'].includes(ctx.body)) { 
            return fallBack(
                'Respuesta No valida. Por favor, selecciona una opción válida',
            );
        }
        switch (ctx.body) {
            case '1':
                return  gotoFlow(flowMenuYoki);
            case '2':
                return  gotoFlow(flowConsultas);
            case '3':
                return  gotoFlow(flowComprar);
            /*case '4':
                return await flowDynamic('Opción 4');
            case '5':
                return await flowDynamic('Opción 5');*/
            case '0':
                return await flowDynamic(
                    'Saliendo... Puedes volver a acceder a este menú escribiendo '*menu*''
                );
        }
    }
);


const main = async () => {
    const adapterDB = new MockAdapter()
    /* const adapterDB = new MongoAdapter({
        dbUri: process.env.MONGO_DB_URI,
        dbName: "YoutubeTest"   */
    const adapterFlow = createFlow([/*flowPrincipal,*/ flowWelcome, menuFlow, flowMenuYoki, flowConsultas, flowComprar]) // Incluyendo flowWelcome en el flujo
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
