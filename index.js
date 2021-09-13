
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const express = require("express");
//const {google} = require("googleapis");

const app = express();

// Google sheet npm package

const { GoogleSpreadsheet } = require('google-spreadsheet');

// File handling package
const fs = require('fs');
//Jouana's Wedding
const RESPONSES_SHEET_ID = '1lHsCy7x2IevpXOwVnH-Z9Xb4vnGnwipJWA3BsL0k4Oo';
//Test
//const RESPONSES_SHEET_ID = '18JVgCtNrC5CIdf49zU_u-GUT5v8BCoGm0D_XMTdUkxI';


// Create a new document
const doc = new GoogleSpreadsheet(RESPONSES_SHEET_ID);

// Credentials for the service account
const CREDENTIALS = JSON.parse(fs.readFileSync('credentials.json'));
var arr = [];

const updateRow = async (keyValue, oldValue, newValue) => {

    // use service account creds
    await doc.useServiceAccountAuth({
        client_email: CREDENTIALS.client_email,
        private_key: CREDENTIALS.private_key
    });

    await doc.loadInfo();

    // Index of the sheet
    let sheet = doc.sheetsByIndex[0];

    let rows = await sheet.getRows();

    let date_ob = new Date();

    let date = ("0" + date_ob.getDate()).slice(-2);

// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
let year = date_ob.getFullYear();

// current hours
let hours = date_ob.getHours();

// current minutes
let minutes = date_ob.getMinutes();

// current seconds
let seconds = date_ob.getSeconds();

// prints date & time in YYYY-MM-DD HH:MM:SS format
console.log(month + "/" + date + "/" + year + " " + hours + ":" + minutes + ":" + seconds);


    for (let index = 0; index < rows.length; index++) {
        const row = rows[index];
        if (row[keyValue] === oldValue) {
            rows[index]['answer'] = newValue;
            rows[index]['date']=month + "/" + date + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
            await rows[index].save();
            break; 
        }
    };
};

const getRows = async (number) => {

  // use service account creds
  await doc.useServiceAccountAuth({
      client_email: CREDENTIALS.client_email,
      private_key: CREDENTIALS.private_key
  });

  // load the documents info
  await doc.loadInfo();

  // Index of the sheet
  let sheet = doc.sheetsByIndex[0];

  // Get all the rows
  let rows = await sheet.getRows();

  return rows;
};

const Msgs = async(msg)=>{
    console.log('MESSAGE RECEIVED', msg.from.slice(0,12),' ',msg.body);
    var res = msg.body.replace(/\D/g, "");
    let isnum = /^\d+$/.test(msg.body);
    if(isnum)
    {
        if(Number(res)<21){

        await updateRow('number',msg.from.slice(0,12),res)
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();
      
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            
            if(row.number==msg.from.slice(0,12)){
                if(Number(row.answer)>0){
                await client.sendMessage(msg.from.slice(0,12)+"@c.us","نتشرف بحضوركم ☺️\nتم تسجيل مشاركتكم بالعرس بنجاح ✌🏼\nنتمنى لكم ليلة خاصة ومميزة\nعدد المشاركين: "+row.answer+"\nسترسل لكم رقم الطاولة لاحقاً")  
                      }else{
                        await client.sendMessage(msg.from.slice(0,12)+"@c.us","نتمنى لكم الخير \nونرجو ان نراكم في مناسبات سعيدة قريباً")
                      }
                    }
        };
    }else{
        await client.sendMessage(msg.from.slice(0,12)+"@c.us","العدد غير معقول: "+res)
    }
        
    }else{
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();

        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            
            if(row.number==msg.from.slice(0,12)){
                if(row['date'].length>0){
                    break;
                      }else{
                        await client.sendMessage(msg.from.slice(0,12)+"@c.us","هنالك خطأ !\nنرجو ادخال عدد المشاركين، فقط الرقم، على سبيل المثال: 3")
                    }
                    }
        };

    }
}



const client = new Client();

client.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});

client.on('ready', async() => {
    console.log('Client is ready!');
    
    
    app.get("/sendMessage", async(req, res) => {
        
        // use service account creds
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();
      
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if(row.number.length>0&&Number(row.sent)==0){
                    rows[index]['sent'] = 1;
                    await rows[index].save();
            await client.sendMessage(row.number+"@c.us","حضرة "+row.name+",\n باسم عروستنا جوانة رمزي نصرالله، نرجو من حضرتك تأكيد المشاركة في سهرة العروس يوم الثلاثاء القريب الموافق 6/7/2021 في قاعة فندق رمادا.\n نرجو ارسال:\n رقم 0 في حال تعذركم عن المشاركة.\nالرقم 1 - مشارك واحد\nالرقم 2 - مشاركين\nوما الى ذلك…\nنرجو لكم سهرة مميزة وليلة انيسة");

            }
        };
        console.log('sendMessage Sent!');

        res.send('sendMessage Sent!');
    });

    app.get("/sendMessage2", async(req, res) => {
        
        // use service account creds
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();
      
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if(row.number.length>0&&Number(row.sent)==0){
                    rows[index]['sent'] = 1;
                    await rows[index].save();
            await client.sendMessage(row.number+"@c.us","البرنامج المحوسب بانتظار ردكم بخصوص المشاركة بفرحة عروستنا جوانة رمزي نصرالله، \nنرجو ارسال: \nفي حال تعذركم عن المشاركة - ارسال الرقم 0 \nمشارك واحد - ارسال الرقم 1 \nمشاركين اثنين - ارسال الرقم 2 \nوما الى ذلك…\nنرجو لكم سهرة مميزة وليلة انيسة");

            }
        };
        console.log('sendMessage Sent!');

        res.send('sendMessage Sent!');
    });
    
    app.get("/remindMessage", async(req, res) => {
        
        // use service account creds
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();
      
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if(row.number.length>0&&!(row.date.length>0)){
            await client.sendMessage(row.number+"@c.us","hi "+row.name)
            }
        };
        console.log('remindMessage Sent!');

        res.send('remindMessage Sent!');
    });


    app.get("/tableMessage", async(req, res) => {
        
        // use service account creds
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();
      
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if(row.number.length>0&&((Number(row.answer)>0))&&(Number(row.table)>0||row.table.includes("+"))&&Number(row.tsent)==0){
                rows[index]['tsent'] = 1;
                await rows[index].save();
            await client.sendMessage(row.number+"@c.us","للتسهيل عليكم، نعلمكم بان رقم طاولتكم في سهرة عروستنا جوانة هو ("+row.table+").\nنلتقي لنفرح سوياً")
            }
        };
        console.log('tableMessage Sent!');

        res.send('tableMessage Sent!');
    });

    app.get("/remindMessage2", async(req, res) => {
        
        // use service account creds
        await doc.useServiceAccountAuth({
            client_email: CREDENTIALS.client_email,
            private_key: CREDENTIALS.private_key
        });
      
        // load the documents info
        await doc.loadInfo();
      
        // Index of the sheet
        let sheet = doc.sheetsByIndex[0];
      
        // Get all the rows
        let rows = await sheet.getRows();
      
        for (let index = 0; index < rows.length; index++) {
            const row = rows[index];
            if(row.number.length>0&&Number(row.answer)>0&&Number(row.rsent)==0){
                rows[index]['rsent'] = 1;
                await rows[index].save();
            await client.sendMessage(row.number+"@c.us",`وين الكف ؟ \nاحمى احمى احمى \nتطبيق "جايين" بحمي السهرة كمان 😂\nكانت مزحة، حبينا نرحب فيكو ونشكركم على مشاركتكم فرحتنا \nاهلا وسهلا`)
            }
        };
        console.log('remindMessage2 Sent!');

        res.send('remindMessage2 Sent!');
    });

});


client.on('message', async msg => {
     //await new Promise(async(resolve, reject) => {await Msgs(msg)}).catch((err)=>{console.log(err)})
     await Msgs(msg)
});




client.initialize();

app.listen(1337,(req,res)=>console.log("running on 1337"));