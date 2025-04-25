import { IvsClient, CreateChannelCommand, GetStreamKeyCommand, ListChannelsCommand } from '@aws-sdk/client-ivs';

class IvsService {
  constructor(region) {
    this.client = new IvsClient({ region: region || 'us-east-1' });
  }

  async createChannel(name, type = 'STANDARD', latencyMode = 'LOW') {
    const command = new CreateChannelCommand({
      name,
      type,
      latencyMode
    });

    try {
      const response = await this.client.send(command);
      return response.channel;
    } catch (error) {
      console.error('Error creating IVS channel:', error);
      throw error;
    }
  }

  async getStreamKey(channelArn) {
    const command = new GetStreamKeyCommand({
      channelArn
    });

    try {
      const response = await this.client.send(command);
      return response.streamKey;
    } catch (error) {
      console.error('Error retrieving stream key:', error);
      throw error;
    }
  }

  async listChannels() {
    const command = new ListChannelsCommand({});

    try {
      const response = await this.client.send(command);
      return response.channels;
    } catch (error) {
      console.error('Error listing channels:', error);
      throw error;
    }
  }
}

export default IvsService;