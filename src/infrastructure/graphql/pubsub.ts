import { PubSub } from 'apollo-server-express';

// TODO replace this with RabbitMQ or Kafka
export const pubsub = new PubSub();

export const SESSION_UPDATE_AVAILABLE = 'SESSION_UPDATE_AVAILABLE';
export const HEALTH_UPDATE_AVAILABLE = 'HEALTH_UPDATE_AVAILABLE';
