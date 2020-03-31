const express = require("express");
const expressGraphQL = require("express-graphql");
const app = express();
const { buildSchema } = require("graphql");

app.use(express.json());

// const schema = new GraphQLSchema({
// 	query: RootQueryType
// });

const events = [];

app.use(
	"/graphql",
	expressGraphQL({
		schema: buildSchema(`
			type Event {
				_id: ID!
				title: String!
				description: String!
				price: Float!
				date: String!
			}

			input EventInput {
				title: String!
				description: String!
				price: Float!
				date: String!
			}

			type RootQuery {
				events: [Event!]!
			}

			type RootMutation {
				createEvent(eventInput: EventInput): Event
			}

			schema {
				query: RootQuery
				mutation: RootMutation
			}
		`),
		rootValue: {
			events: () => {
				return events;
			},
			createEvent: args => {
				const { _id, title, description, price, date } = args.eventInput;
				const event = {
					_id: Math.random().toString(),
					title,
					description,
					price,
					date
				};
				console.log(args.eventInput.title);
				events.push(event);
				return event;
			}
		},
		graphiql: true
	})
);
app.listen(5000, () => console.log("Server Running"));
