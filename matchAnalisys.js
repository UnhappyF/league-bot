(function() {



    module.exports.getMessage = function(game, name) {
        console.log(game)
        console.log(game.participants.find(i=>i.summonerName === name))
        const p_game = game.participants.find(i=>i.summonerName === name)
        let score = p_game.win ? 1 : 0
        const kda = ((parseInt(p_game.kills) + parseInt(p_game.assists)) / (p_game.deaths===0 ? 1 : parseInt(p_game.deaths))).toFixed(2)
        if(kda < 2) {
            score -= 4
        }
        if(kda > 4) {
            score += 4
        }
        let message = name + '\n'
        message += (p_game.win === true ? 'Славная Победа!\n' : 'Позорное Поражение!\n')
        message += `Катка длилась ${(game.gameDuration/60).toFixed(0)} минут\n`
        message += 'https://www.leagueofgraphs.com/ru/match/ru/' + game.gameId +'\n'
        message += p_game.championName + ' ' + p_game.kills + '\\' + p_game.deaths + '\\' + p_game.assists + ' KDA = ' + kda +'\n'


        let sortedDamage = game.participants.filter(i => i.teamId === p_game.teamId).sort((a,b) => b.totalDamageDealtToChampions - a.totalDamageDealtToChampions)
        for(let i = 0; i<sortedDamage.length; i++) {
            if(sortedDamage[i].summonerName === name) {
                message += 'Топ ' + (parseInt(i) + 1) + ' по урону в команде\n'
                if(i<=1){
                    score +=3
                }
                if(i>=3){
                    score -=2
                }
            }
        }
        if(p_game.pentaKills > 0) {
            message += 'Пентакил\n'
            score +=10
        } else {
            if(p_game.quadraKills > 0) {
                message += 'Квадракил\n'
                score +=7
            }
            else {
                if (p_game.trippleKills > 0) {
                    message += 'Триплкил\n'
                    score += 3
                }
            }
        }

        if(p_game.wardsPlaced < 8) {
            message += `Мало вардов, всего ${p_game.wardsPlaced} за игру\n`
            score -= 3
        }

        if(p_game.largestKillingSpree > 5) {
            message += `Стрик килов = ${p_game.largestKillingSpree}, неплохо\n`
            score += 3
        }


        if(p_game.baronKills > 0) {
            score += 5
        }
        message += `дамаг по объектам = ${p_game.damageDealtToObjectives}\n`
        if(p_game.damageDealtToObjectives > 7000) {

            score += 3
        }

        if(p_game.damageDealtToObjectives < 3000) {
            score -= 3
        }

        if(p_game.detectorWardsPlaced === 0) {
            message += `0 пинквардов, чел ты\n`
            score -= 5
        }


        if(p_game.nexusKills > 0) {
            message += `Забрал 50 голды с нексуса, в соло\n`
            score += 1
        }
        message += `Кастовал Q ${p_game.spell1Casts} раз\n`
        message += `Кастовал W ${p_game.spell2Casts} раз\n`
        message += `Кастовал E ${p_game.spell3Casts} раз\n`
        message += `Ультовал ${p_game.spell4Casts} раз\n`



        if(p_game.visionScore > 30) {
            message += `Хороший вижн\n`
            score += 5
        }
        if(p_game.visionScore < 5) {
            message += `Плохой вижн\n`
            score -= 5
        }

        if(p_game.timeCCingOthers === 0 ) {
            message += `0 раз дал СС, серьезно?\n`
            score -= 2
        }
        if(p_game.firstTowerKill) {
            message += `Забрал первую башню\n`
            score += 2
        }
        if(p_game.firstBloodKill) {
            message += `Оформил фб на лошке\n`
            score += 2
        }

        if(p_game.objectivesStolen) {
            message += `Застилил ${p_game.objectivesStolen} объектов\n`
            score += 4*p_game.objectivesStolen
        }

        message += `Заработано ${p_game.goldEarned} голды, из которых потрачено ${p_game.goldSpent}\n`
        message += `Рейтинг: ${score}\n`

        if(score <= 0) {
            message += `Оценка: Ты был камнем в этой команде, твоим тимейтам еще долго будет сниться в кашмарах эта катка\n`
        }
        if(score >= 15 ) {
            message += `Оценка: Гений игры, летишь в мASSтер \n`
        }

        if(score > 0 && score < 15) {
            message += `Оценка: Проходная катка, ничего необычного\n`
        }


        return message



    }

}());