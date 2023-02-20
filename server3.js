const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const graphql = require("graphql");
const joinMonster = require("join-monster");

// Connect to database
const { client } = require("./db_init");
// Define the schema
const Team = new graphql.GraphQLObjectType({
  name: "Team",
  extensions: {
    joinMonster: {
      sqlTable: "team",
      uniqueKey: "id",
    },
  },
  fields: () => ({
    id: { type: graphql.GraphQLInt },
    name: { type: graphql.GraphQLString },
    players: {
      type: graphql.GraphQLList(Player),
      extensions: {
        joinMonster: {
          sqlJoin: (teamTable, playerTable, args) =>
            `${teamTable}.id = ${playerTable}.team_id`,
        },
      },
    },
  }),
});

const Player = new graphql.GraphQLObjectType({
  name: "Player",
  extensions: {
    joinMonster: {
      sqlTable: "player",
      uniqueKey: "id",
    },
  },
  fields: () => ({
    id: { type: graphql.GraphQLString },
    first_name: { type: graphql.GraphQLString },
    last_name: { type: graphql.GraphQLString },
    team: {
      type: graphql.GraphQLList(Team),
      extensions: {
        joinMonster: {
          sqlJoin: (playerTable, teamTable, args) =>
            `${playerTable}.team_id = ${teamTable}.id`,
        },
      },
    },
  }),
});

const Match = new graphql.GraphQLObjectType({
  name: "Match",
  extensions: {
    joinMonster: {
      sqlTable: "match",
      uniqueKey: "id",
    },
  },
  fields: () => ({
    id: { type: graphql.GraphQLInt },
    loser: {
      type: Team,
      extensions: {
        joinMonster: {
          sqlJoin: (matchTable, teamTable, args) =>
            `${matchTable}.loser_team_id = ${teamTable}.id`,
        },
      },
    },
    winner: {
      type: Team,
      extensions: {
        joinMonster: {
          sqlJoin: (matchTable, teamTable, args) =>
            `${matchTable}.winner_team_id = ${teamTable}.id`,
        },
      },
    },
  }),
});

const MutationRoot = new graphql.GraphQLObjectType({
  name: "Mutation",
  fields: () => ({
    player: {
      type: Player,
      args: {
        first_name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
        last_name: { type: graphql.GraphQLNonNull(graphql.GraphQLString) },
        team_id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) },
      },
      resolve: async (parent, args, context, resolveInfo) => {
        try {
          return (
            await client.query(
              "INSERT INTO player (first_name, last_name, team_id) VALUES ($1, $2, $3) RETURNING *",
              [args.first_name, args.last_name, args.team_id]
            )
          ).rows[0];
        } catch (err) {
          throw new Error("Failed to insert new player");
        }
      },
    },
  }),
});

const QueryRoot = new graphql.GraphQLObjectType({
  name: "Query",
  fields: () => ({
    hello: {
      type: graphql.GraphQLString,
      resolve: () => "Hello world!",
    },
    players: {
      type: new graphql.GraphQLList(Player),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },

    player: {
      type: Player,
      args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) } },
      where: (playerTable, args, context) => {
        if (args.id) return `${playerTable}.id = ${args.id}`;
      },
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },
    teams: {
      type: new graphql.GraphQLList(Team),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },
    team: {
      type: Team,
      args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) } },
      where: (teamTable, args, context) => `${teamTable}.id = ${args.id}`,
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },
    matches: {
      type: new graphql.GraphQLList(Match),
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },
    match: {
      type: Match,
      args: { id: { type: graphql.GraphQLNonNull(graphql.GraphQLInt) } },
      where: (teamTable, args, context) => `${teamTable}.id = ${args.id}`,
      resolve: (parent, args, context, resolveInfo) => {
        return joinMonster.default(resolveInfo, {}, (sql) => {
          return client.query(sql);
        });
      },
    },
  }),
});

const schema = new graphql.GraphQLSchema({
  query: QueryRoot,
  mutation: MutationRoot,
});

// Create the Express app
const app = express();
app.use(
  "/api",
  graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);
app.listen(4000, () => console.log("app is running in port 4000"));
