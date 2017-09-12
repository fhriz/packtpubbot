'use strict';

const config = require('./config.json');
const request = require('request').defaults({
    jar: true // enable cookie support, default is false
});
const path = require('path');
const fs = require("fs");
const cheerio = require('cheerio');
const PushBullet = require('pushbullet');

var packtpubBaseUrl = 'https://www.packtpub.com';
var packtpubDownloadEbookUrl = packtpubBaseUrl + "/ebook_download/{ebook_id}/{downloadFormat}";
var packtpubFreeEbookUrl = packtpubBaseUrl + '/packt/offers/free-learning';
var userLoginForm;
var freeEbookUrl;
var ebookId;
var baseDownloadUrl;
var downloadUrl;
var freeEbookTitle;
var formData = {
    email: config.packtpub.email,
    password: config.packtpub.password,
    op: 'Login',
    form_build_id: '',
    form_id: ''
};
var downloadFormates = config.dowloadFormat.split(";");
console.log("----- Start claim free ebook from packtpub -----");
request(packtpubFreeEbookUrl, function(error, response, body) {
    if (error) {
        console.error('first get request', error);
    }
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);
        userLoginForm = $('#packt-user-login-form');
        formData.form_build_id = userLoginForm.find('[name="form_build_id"]').val();
        formData.form_id = userLoginForm.find('[name="form_id"]').val();

        freeEbookTitle = $('.dotd-title').find('h2').text().trim();
        console.log("Claim Title: " + freeEbookTitle);
        inform('Packtpub claim today: ' + freeEbookTitle, function(error, response) {
            if (error) {
                console.error('inform failure', error);
            } else {
                console.log(response);
            }
        });;
    }
});

function inform(content, handler) {
    if (config.informBy == "telegram") {
        informTelegram(content, config.telegram.receiverId, config.telegram.botToken);
    } else if (config.informBy == "pushbullet") {
        informPusher(name, content, handler);
    } else {
        console.log(content);
    }
}

function informPusher(name, content, handler) {
    var pusher = new PushBullet(config.pushbullet.apiKey);
    pusher.note('', name, content, handler);
}

function informTelegram(content, receiver, token) {
    var TelegramBot = require('node-telegram-bot-api');
    // just send the message
    var bot = new TelegramBot(token);
    bot.sendMessage(receiver, content);
}
