(function() {



    module.exports.getMessage = function(game, name) {
        console.log(game)
        console.log(game.participants.find(i=>i.summonerName === name))
        const p_game = game.participants.find(i=>i.summonerName === name)
        let score = p_game.win ? 2 : -1
        const kda = ((parseInt(p_game.kills) + parseInt(p_game.assists)) / (p_game.deaths===0 ? 1 : parseInt(p_game.deaths))).toFixed(2)
        if(kda < 2) {
            score -= 4
        }
        if(kda > 4) {
            score += 4
        }
        let message = name + '\n'
        const gameDurationMins = game.gameDuration/60
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
            score +=10*p_game.pentaKills
        } else {
            if(p_game.quadraKills > 0) {
                message += 'Квадракил\n'
                score +=7*p_game.quadraKills
            }
            else {
                if (p_game.trippleKills > 0) {
                    message += 'Триплкил\n'
                    score += 3*p_game.trippleKills
                }
            }
        }

        if(p_game.wardsPlaced/gameDurationMins < 0.3) {
            message += `Мало вардов, всего ${p_game.wardsPlaced} за игру\n`
            score -= 3
        }

        if(p_game.largestKillingSpree > 5) {
            message += `Стрик килов = ${p_game.largestKillingSpree}, неплохо\n`
            score += p_game.largestKillingSpree
        }


        if(p_game.baronKills > 0) {
            score += 5*p_game.baronKills
        }
        message += `дамаг по объектам = ${p_game.damageDealtToObjectives}\n`
        if(p_game.damageDealtToObjectives/gameDurationMins > 400) {

            score += 3
        }

        if(p_game.damageDealtToObjectives/gameDurationMins < 100) {
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



        if(p_game.visionScore/gameDurationMins > 0.8) {
            message += `Хороший вижн\n`
            score += 5
        }
        if(p_game.visionScore/gameDurationMins < 0.2) {
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

        if(p_game.firstBloodAssist) {
            message += `Помог оформить фб\n`
            score += 1
        }
        if(p_game.firstTowerAssist) {
            message += `Помог забрать первую башню\n`
            score += 1
        }

        if(p_game.objectivesStolen) {
            message += `Застилил ${p_game.objectivesStolen} объектов\n`
            score += 4*p_game.objectivesStolen
        }

        const cs = p_game.totalMinionsKilled + p_game.neutralMinionsKilled

        if(p_game.role !== 'SUPPORT') {
            if (cs / gameDurationMins < 5) {
                message += `Плохой фарм\n`
                score -= 2
            }

            if (cs / gameDurationMins > 7) {
                message += `Хороший фарм\n`
                score += 2
            }



        } else {
            message += `Похилял тимейтов на: ${p_game.totalHealsOnTeammates}\n`

            if(p_game.kills > p_game.assists) {
                message += `Килов больше ассистов, ясно очередной 'саппорт'\n`
            }
        }

        message += `Заработано ${p_game.goldEarned} голды, из которых потрачено ${p_game.goldSpent}\n`
        message += `Проведено в таверне : ${p_game.totalTimeSpentDead} секунд\n`
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




        return [message, score]



    }



}());