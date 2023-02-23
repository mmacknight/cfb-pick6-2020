const articleRoutes = require('./articleRoutes')
const draftRoutes = require('./draftRoutes')
const leagueRoutes = require('./leagueRoutes')
const userRoutes = require('./userRoutes')
const utilityRoutes = require('./utilityRoutes')

module.exports = (router) => {
    return [
        articleRoutes,
        draftRoutes,
        leagueRoutes,
        userRoutes,
        utilityRoutes,
    ].reduce( (router,routes) => routes(router), router)
}
