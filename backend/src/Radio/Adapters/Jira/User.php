<?php

namespace Radio\Adapters;

use Radio\Core\Adapter;

class Jira_User extends Adapter
{
    protected function adapt()
    {
        $user = array(
            '_id' => $this->original['name'],
            'key' => $this->original['name'],
            'name' => $this->original['displayName'],
            'avatar_urls' => $this->original['avatarUrls'],
        );

        $this->adapted = $user;
    }
}