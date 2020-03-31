const express = require("express");
const expressGraphQL = require("express-graphql");
const app = express();
const { buildSchema } = require("graphql");
const connectDB = require("./config/db");
const Event = require("./models/Event");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

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

			type User {
				_id: ID!
				email: String!
				password: String
			}

			input EventInput {
				title: String!
				description: String!
				price: Float!
				date: String!
			}

			input UserInput {
				email: String!
				password: String!
			}

			type RootQuery {
				events: [Event!]!
			}

			type RootMutation {
				createEvent(eventInput: EventInput): Event
				createUser(userInput: UserInput): User
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
						date: new Date(date),
						creator: "5e8364b588944a2474323301"
					});
					const event = await newEvent.save();
					const user = await User.findById("5e8364b588944a2474323301");
					if (!user) {
						return new Error("User Not Exists");
					}
					user.createdEvents.push(event._id);
					await user.save();
					return event;
				} catch (error) {
					console.log(error.message);
					throw error;
				}
			},
			createUser: async args => {
				const { email, password } = args.userInput;
				try {
					let user = await User.findOne({ email });
					if (user) {
						return new Error("User Already Exists");
					}

					const hashedPassword = await bcrypt.hash(password, 10);
					const newUser = new User({ email, password: hashedPassword });
					user = await newUser.save();
					user.password = null;
					return user;
				} catch (error) {
					console.log(error.message);
				}
			}
		},
		graphiql: true
	})
);
connectDB();
app.listen(5000, () => console.log("Server Running"));
