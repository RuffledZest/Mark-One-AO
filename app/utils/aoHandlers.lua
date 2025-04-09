-- AO Chain Handlers for Team and File Management
Handlers = {}
local json = require('json')

-- Initialize SQLite database for storing workspace data
local function initDB()
  local sql = [[    
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS team_members (
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      joined_at INTEGER NOT NULL,
      PRIMARY KEY (team_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS files (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL, 
      name TEXT NOT NULL,
      creator TEXT NOT NULL,
      content TEXT,
      canvas_data TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS file_versions (
      id TEXT PRIMARY KEY,
      file_id TEXT NOT NULL,
      content TEXT,
      canvas_data TEXT,
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS file_permissions (
      file_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      permission TEXT NOT NULL,
      PRIMARY KEY (file_id, user_id)
    );
  ]]

  ao.sqlite(sql)
end

-- Initialize database on process start
initDB()

-- Team Creation Handler
Handlers.add('CreateTeam',
  { Action = 'CreateTeam' },
  function(msg)
    local name = msg.Tags.name
    local team_id = ao.id .. '-team-' .. os.time()
    
    ao.sqlite([[INSERT INTO teams (id, name, owner, created_at) VALUES (?, ?, ?, ?)]],
      team_id, name, msg.From, os.time())

    -- Add creator as admin
    ao.sqlite([[INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)]],
      team_id, msg.From, 'admin', os.time())

    msg.reply({ Data = json.encode({ team_id = team_id }), Success = true })
end)

-- File Creation Handler
Handlers.add('CreateFile',
  { Action = 'CreateFile' },
  function(msg)
    local team_id = msg.Tags.team_id
    local name = msg.Tags.name
    local file_id = ao.id .. '-file-' .. os.time()

    -- Verify team membership
    local isMember = ao.sqlite([[SELECT 1 FROM team_members WHERE team_id = ? AND user_id = ?]],
      team_id, msg.From)

    if not isMember then
      msg.reply({ Error = 'Unauthorized' })
      return
    end

    ao.sqlite([[INSERT INTO files (id, team_id, name, creator, content, canvas_data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)]],
      file_id, team_id, name, msg.From, '', '{}', os.time(), os.time())

    -- Add creator permission
    ao.sqlite([[INSERT INTO file_permissions (file_id, user_id, permission) VALUES (?, ?, ?)]],
      file_id, msg.From, 'owner')

    msg.reply({ Data = json.encode({ file_id = file_id }), Success = true })
end)

-- File Update Handler
Handlers.add('UpdateFile',
  { Action = 'UpdateFile' },
  function(msg)
    local file_id = msg.Tags.file_id
    local content = msg.Tags.content
    local canvas_data = msg.Tags.canvas_data

    -- Verify write permission
    local hasPermission = ao.sqlite([[SELECT 1 FROM file_permissions 
      WHERE file_id = ? AND user_id = ? AND permission IN ('owner', 'write')]],
      file_id, msg.From)

    if not hasPermission then
      msg.reply({ Error = 'Unauthorized' })
      return
    end

    -- Save current version
    local currentVersion = ao.sqlite([[SELECT content, canvas_data FROM files WHERE id = ?]], file_id)
    if currentVersion then
      ao.sqlite([[INSERT INTO file_versions (id, file_id, content, canvas_data, created_by, created_at)
        VALUES (?, ?, ?, ?, ?, ?)]],
        ao.id .. '-version-' .. os.time(), file_id, currentVersion.content,
        currentVersion.canvas_data, msg.From, os.time())
    end

    -- Update file
    ao.sqlite([[UPDATE files SET content = ?, canvas_data = ?, updated_at = ? WHERE id = ?]],
      content, canvas_data, os.time(), file_id)

    msg.reply({ Success = true })
end)

-- File Get Handler
Handlers.add('GetFile',
  { Action = 'GetFile' },
  function(msg)
    local file_id = msg.Tags.file_id

    -- Verify read permission
    local hasPermission = ao.sqlite([[SELECT 1 FROM file_permissions 
      WHERE file_id = ? AND user_id = ? AND permission IN ('owner', 'write', 'read')]],
      file_id, msg.From)

    if not hasPermission then
      msg.reply({ Error = 'Unauthorized' })
      return
    end

    local file = ao.sqlite([[SELECT * FROM files WHERE id = ?]], file_id)
    if file then
      msg.reply({ Data = json.encode(file), Success = true })
    else
      msg.reply({ Error = 'File not found' })
    end
end) 