type Projection = {
  bloodAlcoholContent: number;
  time: number;
  eventHasHappened: boolean;
};

// TODO expose session service as a gql model here
export class Session {
  get initialState(): Projection {
    return {
      bloodAlcoholContent: 0,
      time: Date.now(),
      eventHasHappened: true
    };
  }

  get currentState(): Projection {
    return {
      bloodAlcoholContent: 0,
      time: Date.now(),
      eventHasHappened: true
    };
  }

  get mostDrunkState(): Projection {
    return {
      bloodAlcoholContent: 0,
      time: Date.now(),
      eventHasHappened: true
    };
  }

  get soberState(): Projection {
    return {
      bloodAlcoholContent: 0,
      time: Date.now(),
      eventHasHappened: true
    };
  }
}
