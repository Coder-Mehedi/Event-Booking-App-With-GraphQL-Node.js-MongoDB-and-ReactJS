const express = require("express");
const expressGraphQL = require("express-graphql");
const app = express();
const { buildSchema } = require("graphql");
const connectDB = require("./config/db");
const Event = require("./models/Event");

app.use(express.json());

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
			events: async () => {
				try {
					const events = await Event.find({});
					return events;
				} catch (error) {
					throw error;
				}
			},
			createEvent: async args => {
				const { title, description, price, date } = args.eventInput;
				try {
					const newEvent = new Event({
						title,
						description,
						price,
						date: new Date(date)
					});
					const event = await newEvent.save();
					return event;
				} catch (error) {
					console.log(error.message);
					throw error;
				}
			}
		},
		graphiql: true
	})
);
connectDB();
app.listen(5000, () => console.log("Server Running"));
