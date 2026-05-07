export default {
  // 认证
  login: 'POST /auth/login',
  register: 'POST /auth/register',

  // 用户
  getCurrentUser: 'GET /users/me',
  updateCurrentUser: 'PATCH /users/me',

  // 分类
  getCategories: 'GET /category/',
  getCategory: 'GET /category/:id',

  // 条目
  getEntries: 'GET /entry/',
  getEntry: 'GET /entry/:id',

  // 标题
  getTitles: 'GET /title/',
  getTitle: 'GET /title/:id',
  updateTitle: 'PATCH /title/:id',

  // 条目信息
  getEntryInfoList: 'GET /entryInfo/',
  getEntryInfoDetail: 'GET /entryInfo/:id',

  // 用户条目
  getUserEntryList: 'GET /userEntry/',
  getUserEntry: 'GET /userEntry/:id',
  addUserEntry: 'POST /userEntry/',
  updateUserEntry: 'PATCH /userEntry/:id',
  deleteUserEntry: 'DELETE /userEntry/:id',

  // 结果
  getResult: 'GET /result/:id',
  getResultInfo: 'GET /result/:id/info',
  getResultGroups: 'GET /result/:id/groups',
  getResultCompare: 'GET /result/:id/compare',
} as const
