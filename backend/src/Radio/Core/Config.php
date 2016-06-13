<?php

namespace Radio\Core;

use Pimple\Container;
use Radio\Repositories\ConfigRepository;

class Config
{
    /** @var Container */
    protected $container;

    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    /**
     * Get global config.
     *
     * @return array
     */
    public function getGlobalConfig()
    {
        $globalConfig = ConfigRepository::load('global');
        if (!$globalConfig) {
            $globalConfig = ['_id' => 'global'];
        }

        return $globalConfig;
    }

    /**
     * Get project-specific config.
     *
     * @param $projectKey
     *
     * @return array
     */
    public function getProjectConfig($projectKey)
    {
        $globalConfig = $this->getGlobalConfig();
        $projectConfig = ConfigRepository::load($projectKey);
        if (!$projectConfig) {
            $projectConfig = ['_id' => $projectKey];
        }

        if ($globalConfig) {
            return array_merge($globalConfig, $projectConfig);
        } else {
            return $projectConfig;
        }
    }

    public function getGlobalConfigValue($key)
    {
        $config = $this->getGlobalConfig();
        return isset($config[$key]) ? $config[$key] : null;
    }

    public function getProjectConfigValue($key, $projectKey)
    {
        $config = $this->getProjectConfig($projectKey);
        return isset($config[$key]) ? $config[$key] : null;
    }
}