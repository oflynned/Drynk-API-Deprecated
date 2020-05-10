import { PubSub } from 'apollo-server-express';

// TODO replace this with RabbitMQ
export const pubsub = new PubSub();

export const SESSION_UPDATE_AVAILABLE = 'SESSION_UPDATE_AVAILABLE';
