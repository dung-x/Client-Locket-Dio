import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import BouncyLoader from "../Loading/Bouncy";
import { RiEmotionHappyLine } from "react-icons/ri";
import { TbMoodCrazyHappy } from "react-icons/tb";
import { instanceAuth } from "@/lib/axios.auth";
import { isStorageUp, getStorageBaseUrl } from "@/utils/serverHealth";

const CHECK_INTERVAL = 15000; // kiểm tra lại sau mỗi 15s

function StatusRow({ label, status }) {
  // status: null = đang kiểm tra, true/false = kết quả
  if (status === null) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="inline-grid *:[grid-area:1/1]">
          <div className="status status-warning animate-bounce"></div>
        </div>
        <span className="text-orange-600 font-medium flex items-center">
          Đang kiểm tra {label} <BouncyLoader size={20} color="orange" />
        </span>
      </div>
    );
  }
  if (status) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <div className="inline-grid *:[grid-area:1/1]">
          <div className="status status-success animate-ping"></div>
          <div className="status status-success"></div>
        </div>
        <span className="text-green-600 font-medium flex items-center">
          {label} đang chạy <RiEmotionHappyLine className="ml-1" />
        </span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="inline-grid *:[grid-area:1/1]">
        <div className="status status-error animate-pulse"></div>
      </div>
      <span className="text-red-600 font-medium flex items-center">
        {label} lỗi <TbMoodCrazyHappy className="ml-1" />
      </span>
    </div>
  );
}

const StatusServer = () => {
  const { useloading } = useApp();
  const { isStatusServer, setIsStatusServer } = useloading; // null: đang kiểm tra, true/false: kết quả
  const [isStorageOk, setIsStorageOk] = useState(null);
  const storageConfigured = Boolean(getStorageBaseUrl());

  useEffect(() => {
    let intervalId;

    const checkServer = async () => {
      try {
        const response = await instanceAuth.get("/", {
          timeout: 15000, // tránh treo request
        });
        setIsStatusServer(response.status === 200);
      } catch (error) {
        setIsStatusServer(false);
      }
    };

    const checkStorage = async () => {
      if (!getStorageBaseUrl()) {
        setIsStorageOk(null);
        return;
      }
      setIsStorageOk(await isStorageUp(15000));
    };

    // check lần đầu
    checkServer();
    checkStorage();

    // set interval để check lại sau mỗi 15s
    intervalId = setInterval(() => {
      checkServer();
      checkStorage();
    }, CHECK_INTERVAL);

    // cleanup khi unmount
    return () => clearInterval(intervalId);
  }, [setIsStatusServer]);

  return (
    <div className="flex flex-col gap-1">
      <StatusRow label="Server" status={isStatusServer} />
      {storageConfigured && (
        <StatusRow label="Storage" status={isStorageOk} />
      )}
    </div>
  );
};

export default StatusServer;
