const fs = require('fs');
(function() {



    module.exports.bestCheck = function(score, game, name, message,bot) {

        const data = fs.readFileSync('../db_deprecated/best.json', 'utf8')
        let best = JSON.parse(data)

        const data2 = fs.readFileSync('../db_deprecated/profiles/notifications.json', 'utf8')
        let usersNotifi = JSON.parse(data2)
        console.log(best.score, score, !best.score, best.score < score)
        if(best.length === 0  || best.score < score) {
            const data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
            let players = JSON.parse(data)
            const idNewBest = players.find(i=>i.name===name).vkId
            if(usersNotifi.find(i => i === best.vkId)) {
                if (best.vkId === idNewBest) {
                    bot.sendMessage(best.vkId, 'Ты обновил свой рекорд!\n' + message)
                } else {
                    bot.sendMessage(best.vkId, 'Твой рекорд побили! Новый рекордсмен:\n' + message)
                }
            }




            if(best.vkId !== idNewBest && usersNotifi.find(i=> i === idNewBest)) {
                bot.sendMessage(idNewBest, 'Поздравляю, ты новый король-бог этого сервера!:\n' + message)
            }

            const newBest = {
                vkId: idNewBest,
                game: game,
                name: name,
                score: score
            }

            fs.writeFile('../db_deprecated/best.json', JSON.stringify(newBest), function (err) {
                if (err) throw err;
                console.log('file notifications.json saved!');
            });

        }






    }


    module.exports.worstCheck = function(score, game, name, message,bot) {

        const data = fs.readFileSync('../db_deprecated/worst.json', 'utf8')
        let worst = JSON.parse(data)

        const data2 = fs.readFileSync('../db_deprecated/profiles/notifications.json', 'utf8')
        let usersNotifi = JSON.parse(data2)
        console.log(worst.score, score)


        if(worst.length === 0 || worst.score > score) {
            const data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
            let players = JSON.parse(data)
            const idNewWorst = players.find(i=>i.name===name).vkId
            if(usersNotifi.find(i => i === worst.vkId)) {
                if (worst.vkId === idNewWorst) {
                    bot.sendMessage(worst.vkId, 'Ты обновил свой парашный рекорд! На дно нахуй!\n' + message)
                } else {
                    bot.sendMessage(worst.vkId, 'Твой шутнярский рекорд побили! Играй хуже!:\n' + message)
                }
            }




            if(worst.vkId !== idNewWorst && usersNotifi.find(i=> i === idNewWorst)) {
                bot.sendMessage(idNewWorst, 'Поздравляю, ты новый король параши этого сервера!:\n' + message)
            }

            const newWorst = {
                vkId: idNewWorst,
                game: game,
                name: name,
                score: score
            }

            fs.writeFile('../db_deprecated/worst.json', JSON.stringify(newWorst), function (err) {
                if (err) throw err;
                console.log('file notifications.json saved!');
            });

        }






    }



}());