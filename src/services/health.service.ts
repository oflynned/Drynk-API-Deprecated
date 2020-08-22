const getVersionCode = (version: string): number => {
  return version
    .split('.')
    .map((identifier, index) => {
      if (index === 0) {
        return Number.parseInt(identifier, 10) * 10000;
      } else if (index === 1) {
        return Number.parseInt(identifier, 10) * 100;
      } else {
        return Number.parseInt(identifier, 10);
      }
    })
    .reduce((acc, value) => acc + value, 0);
};

export class HealthService {
  isClientCompatible(clientAppVersion: string): boolean {
    return (
      getVersionCode(this.getMinimumCompatibleAppVersion()) <
      getVersionCode(clientAppVersion)
    );
  }

  getMinimumCompatibleAppVersion() {
    return '1.0.1';
  }
}
