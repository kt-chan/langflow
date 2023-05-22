import { useContext, useEffect, useRef, useState } from "react";
import { FlowType, NodeDataType } from "../../types/flow";
import { classNames, concatFlows, expandGroupNode, isValidConnection, nodeColors, nodeIcons, updateFlowPosition } from "../../utils";
import { typesContext } from "../../contexts/typesContext";
import { Handle, Position, useUpdateNodeInternals } from "reactflow";
import Tooltip from "../../components/TooltipComponent";
import FlowHandle from "./components/flowHandle";
import { XYPosition } from "reactflow"
import { ArrowsPointingOutIcon, TrashIcon } from "@heroicons/react/24/outline";
import HandleComponent from "../GenericNode/components/parameterComponent/components/handleComponent";
import InputParameterComponent from "../GenericNode/components/inputParameterComponent";

export default function GroupNode({ data, selected, xPos, yPos }: { data: NodeDataType, selected: boolean, xPos: number, yPos: number }) {
  const [isValid, setIsValid] = useState(true);
  const { reactFlowInstance, deleteNode } = useContext(typesContext);
  const Icon = nodeIcons['custom'];
  const ref = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const [flowHandlePosition, setFlowHandlePosition] = useState(0);
  useEffect(() => {
    if (ref.current && ref.current.offsetTop && ref.current.clientHeight) {
      setFlowHandlePosition(
        ref.current.offsetTop + ref.current.clientHeight / 2
      );
      updateNodeInternals(data.id);
    }
  }, [data.id, ref, updateNodeInternals, ref.current]);

  useEffect(() => {
    updateNodeInternals(data.id);
  }, [data.id, flowHandlePosition, updateNodeInternals]);
  return (
    <div
      className={classNames(
        isValid ? "animate-pulse-green" : "border-red-outline",
        selected ? "border border-blue-500" : "border dark:border-gray-700",
        "prompt-node relative bg-white dark:bg-gray-900 w-96 rounded-lg flex flex-col justify-center"
      )}
    >
      <div className="w-full dark:text-white flex items-center justify-between p-4 gap-8 bg-gray-50 rounded-t-lg dark:bg-gray-800 border-b dark:border-b-gray-700 ">
        <div className="w-full flex items-center truncate gap-2 text-lg">
          <Icon
            className="w-10 h-10 p-1 rounded"
            style={{
              color: nodeColors['custom'] ?? nodeColors.unknown,
            }}
          />
          <div className="ml-2 truncate">{data.node.flow.name}</div>
          <div>
            {/* <div className="relative w-5 h-5">
                    <CheckCircleIcon
                      className={classNames(
                        validationStatus && validationStatus.valid ? "text-green-500 opacity-100" : "text-red-500 opacity-0",
                        "absolute w-5 hover:text-gray-500 hover:dark:text-gray-300 transition-all ease-in-out duration-300"
                      )}
                    />
                    <ExclamationCircleIcon
                      className={classNames(
                        validationStatus && !validationStatus.valid ? "text-red-500 opacity-100" : "text-red-500 opacity-0",
                        "w-5 absolute hover:text-gray-500 hover:dark:text-gray-600 transition-all ease-in-out duration-300"
                      )}
                    />
                    <EllipsisHorizontalCircleIcon
                      className={classNames(
                        !validationStatus ? "text-yellow-500 opacity-100" : "text-red-500 opacity-0",
                        "w-5 absolute hover:text-gray-500 hover:dark:text-gray-600 transition-all ease-in-out duration-300"
                      )}
                    />
                  </div> */}
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              updateFlowPosition({ x: xPos, y: yPos }, data.node.flow)
              expandGroupNode(data.node.flow, reactFlowInstance)
            }}>
            <ArrowsPointingOutIcon className="w-6 h-6 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-500" />
          </button>
          <button
            onClick={() => {
              console.log(data.id);
              deleteNode(data.id);
            }}
          >
            <TrashIcon className="w-6 h-6 hover:text-red-500 dark:text-gray-300 dark:hover:text-red-500"></TrashIcon>
          </button>
        </div>
      </div>
      <div className="w-full h-full py-5">
        <div className="w-full text-gray-500 dark:text-gray-300 px-5 pb-3 text-sm">
          {data.node.flow.description?.length > 0 ? data.node.flow.description : "No description"}
        </div>
        <div className="flex flex-col items-center justify-center">
          <div
            ref={ref}
            className="w-full flex flex-wrap justify-between items-center bg-gray-50 dark:bg-gray-800 dark:text-white mt-1 px-5 py-2"
          >
            <InputParameterComponent
              data={data}
              color={nodeColors['custom'] ?? nodeColors.unknown}
              title={data.node.template.root_field.display_name}
              tooltipTitle={`Type: ${data.node.base_classes.join(" | ")}`}
              id={[data.type, data.id, ...data.node.base_classes].join("|")}
              type={data.node.base_classes.join("|")}
              left={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}