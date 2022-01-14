const VkBot = require('node-vk-bot-api');
const axios = require('axios');
var Promise = require('promise');
var matchAnalysis = require("./matchAnalisys");
const fs = require('fs');

require('dotenv').config()

console.log(process.env.VK_API_KEY)
const bot = new VkBot(process.env.VK_API_KEY);
const RIOT_API = 'https://ru.api.riotgames.com'
const RIOT_KEY = process.env.RIOT_API_KEY
const ADMIN_ID = process.env.ADMIN_VK_ID



const getRank =  async (id) => {
  return await axios.get(`${RIOT_API}/lol/league/v4/entries/by-summoner/${id}?api_key=${RIOT_KEY}`).then(response => {

      let temp = ''
      response.data.map(i => {
        if(i.queueType === 'RANKED_SOLO_5x5') {
          temp =   i.tier + ' ' + i.rank + ' ' + i.leaguePoints + ' ' + i.summonerName + '\n'
        }
      })
    return temp

  })

}



bot.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    console.error(e);
  }
});

bot.command('/add', async (ctx) => {
  let c = ctx.message.text.split(' ')
  console.log(ctx)
  if(c.length < 3) {

    await ctx.reply('Ошибка, пример команды /add RU UnhappyFrog');
  } else {
    await axios.get(`${RIOT_API}/lol/summoner/v4/summoners/by-name/${encodeURI(c[2])}?api_key=${RIOT_KEY}`).then(response => {
      console.log(response.data)

      try {
        let data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
        data = JSON.parse(data)
        console.log(data, c[2], i=>i.name===c[2])
        if(data.find(i=>i.name===c[2])) {
          ctx.reply(`Я его уже знаю, клоун`);
        } else {
          data.push(response.data)
          fs.writeFile('../db_deprecated/profiles/profiles.json', JSON.stringify(data), function (err) {
            if (err) throw err;
            console.log('file profiles saved!');
          });
        }
      } catch (err) {
        console.error(err)
      }


    })
        .catch(()=>{
          ctx.reply(`Нет такого`);
        })
    await ctx.reply(`Hello, ${c[2]} from ${c[1]}`);
  }
});



bot.command('/bind', async (ctx) => {
  let c = ctx.message.text.split(' ')
  console.log(ctx)
  if(c.length < 3) {

    await ctx.reply('Ошибка, пример команды /bind RU UnhappyFrog');
  } else {
    await axios.get(`${RIOT_API}/lol/summoner/v4/summoners/by-name/${encodeURI(c[2])}?api_key=${RIOT_KEY}`).then(response => {
      console.log(response.data)

      try {
        let data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
        data = JSON.parse(data)
        console.log(data, c[2], i=>i.name===c[2])
        if(data.find(i=>i.name===c[2])) {
          if(data.find(i=>i.vkId === ctx.message.from_id))
            data.find(i=>i.vkId === ctx.message.from_id).vkId=0
          data.find(i=>i.name===c[2]).vkId=ctx.message.from_id
          fs.writeFile('../db_deprecated/profiles/profiles.json', JSON.stringify(data), function (err) {
            if (err) throw err;
            console.log('file profiles saved!');
          });
        } else {
          ctx.reply(`Аккаунта нет в базе`);
        }
      } catch (err) {
        console.error(err)
      }


    })
        .catch(()=>{
          ctx.reply(`Аккаунта нет в базе`);
        })
    await ctx.reply(`${c[2]} привязан к аккаунту ${ctx.message.from_id}`);
  }
});

bot.command('/ranks', async (ctx) => {

  try {
    const data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
    let players = JSON.parse(data)
    let table = ''
    Promise.all(players.map(i=>{
      return getRank(i.id).then(res => {table+=res; console.log(table)})
    })).then(()=>{
      console.log(table)
      ctx.reply(table)})



  } catch (err) {
    console.error(err)
  }

});

bot.command('/attention', async (ctx) => {

  let c = ctx.message.text.split(' ').slice(1,ctx.message.text.split(' ').length).join(' ')
  try {
    bot.sendMessage(2000000002, c);



  } catch (err) {
    console.error(err)
  }

});

bot.command('/notificationSend', async (ctx) => {

  console.log(ctx.message.from_id)
  let c = ctx.message.text.split(' ').slice(1,ctx.message.text.split(' ').length).join(' ')
  try {
    if(ADMIN_ID === ctx.message.from_id) {
      const data = fs.readFileSync('../db_deprecated/profiles/notifications.json', 'utf8')
      let users = JSON.parse(data)

      users.map(i=>bot.sendMessage(i, c))
      console.log('рассылка проведена')

    } else {
      ctx.reply('У тебя здесь нет власти')
    }

  } catch (err) {
    console.error(err)
  }

});


bot.command('/notifications', async (ctx) => {

  try {
    const data = fs.readFileSync('../db_deprecated/profiles/notifications.json', 'utf8')
    let users = JSON.parse(data)

    if(users.find(i=>i===ctx.message.from_id)){
      users = users.filter(i=>i!==ctx.message.from_id)
      ctx.reply('Вы отписались от уведомлений')
    } else {
      users.push(ctx.message.from_id)
      ctx.reply('Вы подписались на уведомления, чтобы отписаться напишите /notifications')
    }

    fs.writeFile('../db_deprecated/profiles/notifications.json', JSON.stringify(users), function (err) {
      if (err) throw err;
      console.log('file notifications.json saved!');
    });

  } catch (err) {
    console.error(err)
  }

});



bot.command('/help', async (ctx) => {

  try {

      ctx.reply('/add сервер ник   //добавить аккаунт в базу\n' +
          '/bind сервер ник   //привязать аккаунт к вк\n' +
          '/ranks   //ранги аккаунтов в базе\n' +
          '/шутняра   //худшее кда за последние 1 каток среди всех аккаунтов\n' +
          '/best   //шутняра наоборот\n' +
          '/last   //твоя последняя катка\n' +
          '/last full   //твоя последняя катка с анализом\n' +
          '/парад бомжей   //парад бомжей\n' +
          '/quiz   //загадочка\n' +
          '/ans ответ   //дать ответ\n' +
          '/mastery   //твое мастерство\n' +
          '/live   //кто сейчас играет\n' +
          '/live me   //твоя текущяя игра\n' +
          '/iq   //твой iq\n')


  } catch (err) {
    console.error(err)
  }

});

const getMatchMessage = (res2, name) => {


  console.log(res2.participants.find(i=>i.summonerName === name))
  const p_game = res2.participants.find(i=>i.summonerName === name)

  let message = name + '\n'
  message += (p_game.win === true ? 'Славная Победа!\n' : 'Позорное Поражение!\n')
  message += 'https://www.leagueofgraphs.com/ru/match/ru/' + res2.gameId +'\n'
  message += p_game.championName + ' ' + p_game.kills + '\\' + p_game.deaths + '\\' + p_game.assists + ' KDA = ' + ((parseInt(p_game.kills) + parseInt(p_game.assists)) / (p_game.deaths===0 ? 1 : parseInt(p_game.deaths))).toFixed(2) +'\n'


  let sortedDamage = res2.participants.filter(i => i.teamId === p_game.teamId).sort((a,b) => b.totalDamageDealtToChampions - a.totalDamageDealtToChampions)
  for(let i = 0; i<sortedDamage.length; i++) {
    if(sortedDamage[i].summonerName === name)
      message += 'Топ ' + (parseInt(i)+1 ) + ' по урону в команде\n'
  }
  if(p_game.pentaKills > 0) {
    message += 'Пентакил\n'
  } else {
    if(p_game.quadraKills > 0) {
      message += 'Квадракил\n'
    }
  }
  return message

}
bot.command('/last', async (ctx) => {

  try {
    let c = ctx.message.text.split(' ')

    const data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
    let players = JSON.parse(data)

    const p = players.find(i => i.vkId === ctx.message.from_id)
    if(p) {

      await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${p.puuid}/ids?start=0&count=1&api_key=${RIOT_KEY}`).then(async res => {


        await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/${res.data[0]}?api_key=${RIOT_KEY}`).then(res2 => {
          if(c[1] && c[1] === 'full') {
            ctx.reply(matchAnalysis.getMessage(res2.data.info, p.name))
          } else {
            ctx.reply(getMatchMessage(res2.data.info, p.name))
          }
        })

      })


    } else {
      ctx.reply(`Аккаунт не привязан`);
    }

  } catch (err) {
    console.error(err)
  }

});

const getLiveById =  async (id) => {
  return await axios.get(`${RIOT_API}/lol/spectator/v4/active-games/by-summoner/${id}?api_key=${RIOT_KEY}`).then(t => {

    return {id: id, data: t.data}

  })
      .catch(e=>{})


}

bot.command('/live', async (ctx) => {
  try {
    let c = ctx.message.text.split(' ')
    let table = []
    if (c[1] === 'me') {
      const data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
      let players = JSON.parse(data)
      const p = players.find(i=>i.vkId === ctx.message.from_id)

      if(p) {
        getLiveById(p.id).then(res => {
          if(res) {

            let champName
            let message =''

            const data = fs.readFileSync('./champions.json', 'utf8')
            let champs = JSON.parse(data).data
            const champId = res.data.participants.find(j=>j.summonerId === res.id).championId
            for (let c in champs) {
              let value = champs[c]
              if(value.key == champId) {
                champName = value.name
              }

            }
            message += players.find(j=>j.id===res.id).name +' на ' + champName + '\nhttps://porofessor.gg/live/ru/'+ players.find(j=>j.id===res.id).name+'\n'

            ctx.reply(message);



          } else {
            ctx.reply('Ты не в катке шутняра');
          }

        })
      } else {
        ctx.reply('Аккаунт не привязан');
      }


    }

    if (c[1] === 'all' || !c[1]) {
      const data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
      let players = JSON.parse(data)

      Promise.all(players.map(i=>{
        return getLiveById(i.id).then(res => {
          if(res)
            table.push(res);
          }).catch(e=>{})
      })).catch(e=>console.log(e))
          .then(()=>{



        console.log(table)

            if(table.length === 0) {
              ctx.reply(`Сейчас никто не играет`);
            } else {
              let message = ''
              let champName = '';
              const data = fs.readFileSync('./champions.json', 'utf8')
              let champs = JSON.parse(data).data
              table.map(i=> {
                const champId = i.data.participants.find(j=>j.summonerId === i.id).championId
                for (let c in champs) {
                  let value = champs[c]
                  if(value.key == champId) {
                    champName = value.name
                  }

                }
                message += players.find(j=>j.id===i.id).name +' на ' + champName + '\nhttps://porofessor.gg/live/ru/'+ players.find(j=>j.id===i.id).name+'\n'
              })
              ctx.reply(message);
            }
        })
          .catch(e=>console.log(e))
    }

  } catch (err) {
    console.log(err)
  }


  });

bot.command('/mastery', async (ctx) => {

  try {

    let c = ctx.message.text.split(' ')
    const data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
    let players = JSON.parse(data)

    const p = players.find(i => i.vkId === ctx.message.from_id)
    if(p) {

      await axios.get(`${RIOT_API}/lol/champion-mastery/v4/champion-masteries/by-summoner/${p.id}?api_key=${RIOT_KEY}`).then(async res => {

        const data = fs.readFileSync('./champions.json', 'utf8')
        let champs = JSON.parse(data).data

        res = res.data
        res = res.slice(0,c.length === 2 ? c[1] : 5)
        console.log(res)

        let message = '';
        res.map(i => {
          for (let c in champs) {
            let value = champs[c]
            console.log(value.key, i.championId)
            if(value.key == i.championId) {
              message += value.name + '   |   ' + i.championPoints + ' pts\n'

            }

          }
        })
        console.log(message)
        ctx.reply(message)
      })


    } else {
      ctx.reply(`Аккаунт не привязан`);
    }

  } catch (err) {
    console.error(err)
  }

});

let quiz_ans = ''
bot.command('/quiz', async (ctx) => {

  try {

    quiz_ans = ''

    let c = ctx.message.text.split(' ')

    const data = fs.readFileSync('./champions_ru.json', 'utf8')
        let champs = JSON.parse(data).data

    const rand = (Math.random() * (Object.keys(champs).length)).toFixed(0);
    let i=0
    let message = ''
    for (let c in champs) {
      let value = champs[c]
      if(i===parseInt(rand)) {
        message = value.title
        quiz_ans = value.name

      }
      i++

    }


        console.log(message)
        ctx.reply(message)


  } catch (err) {
    console.error(err)
  }

});

bot.command('/ans', async (ctx) => {

  try {

    let c = ctx.message.text.split(' ')
    console.log(c[1].toLocaleLowerCase(), quiz_ans.toLocaleLowerCase().split(' ')[0]);
    if(c[1].toLocaleLowerCase() === quiz_ans.toLocaleLowerCase().split(' ')[0]){
      quiz_ans = undefined
    const data = fs.readFileSync('../db_deprecated/profiles/quiz.json', 'utf8')
    let players = JSON.parse(data)

    if(players.find(i=>i.vk===ctx.message.from_id)){
      players.find(i=>i.vk===ctx.message.from_id).pts++
    } else {
      players.push({vk: ctx.message.from_id, pts: 1})
    }
    fs.writeFile('../db_deprecated/profiles/quiz.json', JSON.stringify(players), function (err) {
      if (err) throw err;
      console.log('file profiles saved!');
    });

      ctx.reply('Гений, +1 pts')
    } else {

      ctx.reply('Шутняра')
    }


  } catch (err) {
    console.error(err)
  }

});

bot.command('/anek', async (ctx) => {

  try {



    let c = ctx.message.text.split(' ')

    const data = fs.readFileSync('../db_deprecated/anek/anekdots.json', 'utf8')
    let aneks = JSON.parse(data)
    const rand = Math.trunc(Math.random()*aneks.length)
    console.log(rand)
    ctx.reply(aneks[rand].anek)


  } catch (err) {
    console.error(err)
  }

});

bot.command('/about', async (ctx) => {

  try {

    ctx.reply('LeagueBot © 2022 Александр Абазов\nGithub проекта: https://github.com/UnhappyF/league-bot\n')


  } catch (err) {
    console.error(err)
  }

});

bot.command('/iq', async (ctx) => {

  try {
      const data = fs.readFileSync('../db_deprecated/profiles/quiz.json', 'utf8')
      let players = JSON.parse(data)
      let message = ''
      if(players.find(i=>i.vk===ctx.message.from_id)){
        message = 'У тебя ' + players.find(i=>i.vk===ctx.message.from_id).pts + ' IQ из 1000'
      } else {
        message = 'Вас давно не видели в уличных гонках, пиши /quiz'
      }


      ctx.reply(message)




  } catch (err) {
    console.error(err)
  }

});

const getMatch = async (id) => {

  return await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/${id}?api_key=${RIOT_KEY}`).catch(e=> {console.log(e)})
}

let test = []
const getWorstOf = async (puuid, count, ctx) => {
  return await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}&api_key=${RIOT_KEY}`).then( res => {
    let mas = []

    Promise.all(res.data.map(i=>{
      return getMatch(i).then(val=>{mas.push(val.data.info)})
    })).then(()=>{


      let ans = mas.sort((a,b)=>{
        const a2 = a.participants.find(i=>i.puuid===puuid)
        const b2 = b.participants.find(i=>i.puuid===puuid)
        if(a2.deaths === 0)
          return 1
        if(b2.deaths === 0)
          return -1
        return (a2.kills + a2.assists) / a2.deaths - (b2.kills + b2.assists) / b2.deaths

      })


      test.push({
        puuid: puuid,
        matchm: ans[0]
      })

    })

  }).catch(err=>{ctx.reply('Брат рито душат, подожди минуту');console.log(err)}
  )


}

const getKDA = (p) => {
  if(p.deaths===0) p.deaths=1
  return ((p.kills + p.assists) / p.deaths).toFixed(3)
}

bot.command('/шутняра', async (ctx) => {

  test = []

  try {
    const data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
    let players = JSON.parse(data)

    Promise.all(players.map(i=>{
      return getWorstOf(i.puuid, 1, ctx).then(res=>console.log(res))
    })).then(()=>{

      })

    setTimeout(()=>{
      try {



        let loser = test.sort((a, b) => {
          return getKDA(a.matchm.participants.find(i => i.puuid === a.puuid)) - getKDA(b.matchm.participants.find(i => i.puuid === b.puuid))

        })[0]


        let msg = getMatchMessage(loser.matchm, loser.matchm.participants.find(i => i.puuid === loser.puuid).summonerName)
        if (loser.matchm.participants.find(i => i.puuid === loser.puuid).win) {
          msg += 'Бомжа чюдом закерили\n'
        } else {
          msg += 'Такую свинью не закерить\n'
        }
        ctx.reply('Главный шутняра сегодня: \n' + msg);
      } catch {

      }
    }, 2000)


  } catch (err) {
    console.error(err)
    ctx.reply('Рито душат, брат. Подожди минуту');
  }

});


bot.command('/парад бомжей', async (ctx) => {

  test = []

  try {
    const data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
    let players = JSON.parse(data)

    Promise.all(players.map(i=>{
      return getWorstOf(i.puuid, 2, ctx).then(res=>console.log(res))
    })).then(()=>{

    })

    setTimeout(()=>{
      try {


        console.log(test)
        ctx.reply('Как же я люблю БТС, вот они слева направо: \n');
        test.map(loser=>{
          let msg = getMatchMessage(loser.matchm, loser.matchm.participants.find(i => i.puuid === loser.puuid).summonerName)
          if (loser.matchm.participants.find(i => i.puuid === loser.puuid).win) {
            msg += 'Бомжа чюдом закерили\n'
          } else {
            msg += 'Такую свинью не закерить\n'
          }
          ctx.reply(msg);
        })


      } catch {

      }
    }, 2000)


  } catch (err) {
    console.error(err)
    ctx.reply('Рито душат, брат. Подожди минуту');
  }

});

let test2 = []
const getBestOf = async (puuid, count, ctx) => {
  return await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}&api_key=${RIOT_KEY}`).then( res => {
    let mas = []

    Promise.all(res.data.map(i=>{
      return getMatch(i).then(val=>{mas.push(val.data.info)})
    })).then(()=>{


      let ans = mas.sort((a,b)=>{
        const a2 = a.participants.find(i=>i.puuid===puuid)
        const b2 = b.participants.find(i=>i.puuid===puuid)
        if(a2.deaths === 0)
          return 1
        if(b2.deaths === 0)
          return -1
        return (b2.kills + b2.assists) / b2.deaths - (a2.kills + a2.assists) / a2.deaths

      })


      test2.push({
        puuid: puuid,
        matchm: ans[0]
      })

    })

  }).catch(err=>{ctx.reply('Брат рито душат, подожди минуту');console.log(err)})


}

bot.command('/best', async (ctx) => {

  test2 = []

  try {
    const data = fs.readFileSync('../db_deprecated/profiles/profiles.json', 'utf8')
    let players = JSON.parse(data)

    Promise.all(players.map(i=>{
      return getBestOf(i.puuid, 1, ctx).then(res=>console.log(res))
    })).then(()=>{

    })

    setTimeout(()=>{
      console.log(test2)
      try {


        let winner = test2.sort((a, b) => {
          return getKDA(b.matchm.participants.find(i => i.puuid === b.puuid)) - getKDA(a.matchm.participants.find(i => i.puuid === a.puuid))

        })[0]

        let msg = getMatchMessage(winner.matchm, winner.matchm.participants.find(i => i.puuid === winner.puuid).summonerName)
        if (winner.matchm.participants.find(i => i.puuid === winner.puuid).win) {
          msg += 'Закерил бомжей в соло\n'
        } else {
          msg += 'Тим диф был слишком велик\n'
        }
        ctx.reply('Гроза бомжей ру сервера: \n' + msg);
      } catch {

      }
    }, 2000)


  } catch (err) {
    console.error(err)
  }

});

bot.startPolling((err) => {
  if (err) {
    console.error(err);
  }
});