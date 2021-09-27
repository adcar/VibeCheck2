create table karma(id char(18), score int);

-- int = unix time
create table cooldowns(id char(18), voteExpire int, silverExpire int, goldExpire int, platExpire int);
