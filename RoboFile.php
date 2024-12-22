<?php
/**
 * This is project's console commands configuration for Robo task runner.
 *
 * @see https://robo.li/
 */
class RoboFile extends \Robo\Tasks
{
    /**
     * 构建Docker镜像
     *
     * @param string $tag 镜像标签，默认为latest
     */
    public function dockerBuild($tag = 'latest')
    {
        $this->_exec("cd server && docker build -t ai-rss:{$tag} .");
    }

    /**
     * 发布Docker镜像到Docker Hub
     *
     * @param string $username Docker Hub用户名
     * @param string $tag 镜像标签，默认为latest
     */
    public function dockerPub($username='easychen', $tag = 'latest')
    {
        $this->_exec("cd server && docker build -t ai-rss:{$tag} . && docker tag ai-rss:{$tag} {$username}/ai-rss:{$tag} && docker push {$username}/ai-rss:{$tag}");
    }
}