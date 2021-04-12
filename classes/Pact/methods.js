module.exports = [
  { kubikName: 'companies.channels.conversations', apiName: 'companies/{{companyId}}/channels/{{channelId}}/conversations' },
  { kubikName: 'companies.conversations.messages', apiName: 'companies/{{companyId}}/conversations/{{conversationId}}/messages' },
  { kubikName: 'companies.conversations.messages.attachments', apiName: 'companies/{{companyId}}/conversations/{{conversationId}}/messages/attachments' },
  { kubikName: 'companies.conversationsGet', apiName: 'companies/{{companyId}}/conversations/{{conversationId}}' }
];
